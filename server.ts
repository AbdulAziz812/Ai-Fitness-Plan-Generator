import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db } from './server/db.ts';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fitai-secure-jwt-secret-key-2025';
const PORT = 3000;

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded || !decoded.id) {
      res.status(403).json({ error: 'Invalid or expired session token.' });
      return;
    }
    const user = db.findUserById(decoded.id);
    req.user = {
      id: decoded.id,
      email: user ? user.email : (decoded.email || 'athlete@fitai.app'),
      name: user ? user.name : (decoded.name || 'Athlete')
    };
    next();
  });
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- Health Check ---
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'FITAI API' });
  });

  // --- Auth Routes ---
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ error: 'Full name is required.' });
        return;
      }
      if (!email || !email.trim()) {
        res.status(400).json({ error: 'Email address is required.' });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }
      if (!password || password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        return;
      }
      if (password !== confirmPassword) {
        res.status(400).json({ error: 'Passwords do not match.' });
        return;
      }

      // Also store user locally so full name and credentials persist across sessions
      try {
        const existing = db.findUserByEmail(email.trim());
        if (!existing) {
          await db.createUser(name.trim(), email.trim(), password);
        } else {
          await db.updateUser(existing.id, { name: name.trim() });
        }
      } catch (dbErr) {
        console.warn('Local user registration sync note:', dbErr);
      }

      // Forward account data directly to n8n webhook for Google Sheets storage
      const webhookUrl = 'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/451bf6cd-0025-49d8-b927-18a75ec8ae36';
      
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'account_created',
            name: name.trim(),
            email: email.trim(),
            password: password,
            created_at: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            source: 'create_account_button',
          }),
        });
      } catch (webhookErr) {
        console.warn('Webhook dispatch failed:', webhookErr);
      }

      res.status(200).json({
        success: true,
        message: 'Account details sent to n8n webhook for Google Sheets storage.',
        name: name.trim(),
        email: email.trim(),
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: err.message || 'Internal server error during account creation.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      // Do NOT check or store in local database:
      // Forward login event directly to n8n webhook for Google Sheets verification/logging
      const webhookUrl = 'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/e457e6c1-eb29-4465-9c37-668771f81f42';
      
      let n8nResponse: any = null;

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'login',
            email: email.trim(),
            password: password,
            timestamp: new Date().toISOString(),
            source: 'login_button',
          }),
        });

        const text = await webhookResponse.text();
        if (text && text.trim()) {
          try {
            n8nResponse = JSON.parse(text);
          } catch {
            n8nResponse = { success: webhookResponse.ok };
          }
        } else {
          n8nResponse = { success: webhookResponse.ok };
        }

        console.log('n8n LOGIN RESPONSE:', n8nResponse);

        if (!webhookResponse.ok || (n8nResponse && n8nResponse.success === false)) {
          res.status(401).json({
            error: (n8nResponse && n8nResponse.message) || 'Invalid email or password.'
          });
          return;
        }
      } catch (webhookErr) {
        console.warn('Login webhook dispatch failed:', webhookErr);
      }

      // Look up existing registered user or fitness profile to get their full registered name
      const existingUser = db.findUserByEmail(email.trim());
      const existingProfile = existingUser ? db.getFitnessProfile(existingUser.id) : undefined;
      
      const userId = existingUser ? existingUser.id : 'user_' + Buffer.from(email.trim().toLowerCase()).toString('hex').slice(0, 12);
      
      // Fallback name logic: 1. existingUser.name, 2. existingProfile.name, 3. cleaned email prefix
      let resolvedName = '';
      if (existingUser && existingUser.name && existingUser.name.trim()) {
        resolvedName = existingUser.name.trim();
      } else if (existingProfile && existingProfile.name && existingProfile.name.trim()) {
        resolvedName = existingProfile.name.trim();
      } else {
        const displayName = email.trim().split('@')[0] || 'Athlete';
        resolvedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      }

      const user = {
        id: userId,
        userId: userId,
        name: resolvedName,
        email: email.trim(),
        created_at: existingUser ? existingUser.created_at : new Date().toISOString(),
      };

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // After successful login verification, query Google Sheets plan webhook for existing fitness plan
      let fetchedPlan: any = n8nResponse?.plan || null;
      if (!fetchedPlan) {
        try {
          const planWebhookUrl = 'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/00b411fc-3140-4a00-a12c-5f1f48d52401';
          const planRes = await fetch(planWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              user_id: user.id,
              'User ID': user.id,
              email: user.email,
              Email: user.email,
            }),
          });
          if (planRes.ok) {
            const planText = await planRes.text();
            if (planText && planText.trim()) {
              try {
                const planData = JSON.parse(planText);
                console.log('Fetched old plan from webhook on login:', planData);
                fetchedPlan = planData.plan || (Array.isArray(planData.plans) ? planData.plans[0] : (planData.workout_plan ? planData : null));
              } catch {
                // non-json response
              }
            }
          }
        } catch (planErr) {
          console.warn('Plan fetch webhook on login notice:', planErr);
        }
      }

      // Fall back to local database plan if webhook returned none
      if (!fetchedPlan) {
        fetchedPlan = db.getCurrentPlan(user.id);
      }

      res.json({
        success: true,
        message: 'Logged in successfully.',
        user,
        token,
        plan: fetchedPlan || null,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    const user = db.findUserById(req.user!.id);
    const profile = db.getFitnessProfile(req.user!.id);
    
    if (user) {
      res.json({
        user: {
          id: user.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        profile
      });
      return;
    }

    // Fallback if not stored directly in users table (e.g. check profile or token)
    const resolvedName = (profile && profile.name && profile.name.trim()) || req.user!.name || 'Athlete';

    res.json({
      user: {
        id: req.user!.id,
        userId: req.user!.id,
        name: resolvedName,
        email: req.user!.email,
        created_at: new Date().toISOString(),
      }
    });
  });

  app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = db.findUserById(req.user!.id);
      if (existingUser) {
        const updated = await db.updateUser(req.user!.id, { name, email, password });
        res.json({
          message: 'Profile updated successfully.',
          user: {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            created_at: updated.created_at,
            updated_at: updated.updated_at
          }
        });
        return;
      }

      res.json({
        message: 'Profile updated successfully.',
        user: {
          id: req.user!.id,
          name: (name && name.trim()) || req.user!.name,
          email: (email && email.trim()) || req.user!.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update profile.' });
    }
  });

  // --- Fitness Profile Routes ---
  app.get('/api/fitness-profile', authenticateToken, (req: AuthRequest, res) => {
    const profile = db.getFitnessProfile(req.user!.id);
    res.json({ profile: profile || null });
  });

  app.post('/api/fitness-profile', authenticateToken, (req: AuthRequest, res) => {
    try {
      const { name, age, height, weight, goal, level, schedule, workout_duration, equipment, food_preference } = req.body;

      if (!goal || !level || !schedule || !equipment) {
        res.status(400).json({ error: 'Please complete all required fields.' });
        return;
      }

      const saved = db.saveFitnessProfile(req.user!.id, {
        name: name || req.user!.name,
        age,
        height,
        weight,
        goal,
        level,
        schedule,
        workout_duration: workout_duration || '30–45 Minutes',
        equipment: Array.isArray(equipment) ? equipment : [equipment],
        food_preference
      });

      // Also update user name if provided and changed
      if (name && name.trim() && name.trim() !== req.user!.name) {
        db.updateUser(req.user!.id, { name });
      }

      res.json({
        message: 'Fitness information saved successfully.',
        profile: saved
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Something went wrong while saving profile.' });
    }
  });

  // --- Fitness Plans Routes ---
  app.get('/api/fitness-plans', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const response = await fetch(
        'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/00b411fc-3140-4a00-a12c-5f1f48d52401',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: req.user!.id,
            user_id: req.user!.id,
            'User ID': req.user!.id,
            email: req.user!.email,
            Email: req.user!.email,
          }),
        }
      );

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          try {
            const data = JSON.parse(text);
            let planList = [];
            if (Array.isArray(data)) {
              planList = data;
            } else if (Array.isArray(data.plans)) {
              planList = data.plans;
            } else if (data.plan) {
              planList = [data.plan];
            } else if (data.workout_plan) {
              planList = [data];
            }

            if (planList.length > 0) {
              res.json({ plans: planList });
              return;
            }
          } catch {
            // response was not JSON, fallback cleanly
          }
        }
      }
    } catch (err) {
      console.warn('Webhook getFitnessPlans notice:', err);
    }

    const plans = db.getUserPlans(req.user!.id);
    res.json({ plans });
  });

  app.get('/api/fitness-plans/current', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const response = await fetch(
        'https://ai-skool-n8n-57b1748669d9.herokuapp.com/webhook/00b411fc-3140-4a00-a12c-5f1f48d52401',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: req.user!.id,
            user_id: req.user!.id,
            'User ID': req.user!.id,
            email: req.user!.email,
            Email: req.user!.email,
          }),
        }
      );

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          try {
            const data = JSON.parse(text);
            const plan = data.plan || (Array.isArray(data.plans) ? data.plans[0] : (data.workout_plan ? data : null));
            if (plan) {
              res.json({ plan });
              return;
            }
          } catch {
            // response was not JSON, fallback cleanly
          }
        }
      }
    } catch (error) {
      console.warn('Current plan webhook notice:', error);
    }

    const localPlan = db.getCurrentPlan(req.user!.id);
    res.json({ plan: localPlan || null });
  });

  app.get('/api/fitness-plans/:id', authenticateToken, (req: AuthRequest, res) => {
    const plan = db.getPlanById(req.user!.id, req.params.id);
    if (!plan) {
      res.status(404).json({ error: 'Fitness plan not found.' });
      return;
    }
    res.json({ plan });
  });

  app.put('/api/fitness-plans/:id/current', authenticateToken, (req: AuthRequest, res) => {
    try {
      const plan = db.setCurrentPlan(req.user!.id, req.params.id);
      res.json({ message: 'Active plan updated.', plan });
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'Plan not found.' });
    }
  });

  app.delete('/api/fitness-plans/:id', authenticateToken, (req: AuthRequest, res) => {
    const deleted = db.deletePlan(req.user!.id, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Plan not found or could not be deleted.' });
      return;
    }
    res.json({ message: 'Plan deleted successfully.' });
  });


  // --- Vite / Static file serving ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FITAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
