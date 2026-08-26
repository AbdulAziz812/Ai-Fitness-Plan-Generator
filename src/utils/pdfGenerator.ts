import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FitnessPlan } from '../types';

export function generatePlanPDF(plan: FitnessPlan, userName: string) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [34, 197, 94]; // #22C55E
    const darkBg: [number, number, number] = [17, 24, 39]; // #111827
    const secondaryColor: [number, number, number] = [6, 182, 212]; // #06B6D4
    const textDark: [number, number, number] = [30, 41, 59]; // #1E293B

    // --- Header / Cover Banner ---
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, 210, 48, 'F');

    // FITAI Logo / Brand
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('FITAI', 15, 20);

    doc.setTextColor(248, 250, 252);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-POWERED PERSONAL FITNESS PROGRAM', 15, 28);

    doc.setTextColor(...secondaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(plan.title || 'Personalized Fitness Plan', 15, 38);

    // Right side user details
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Athlete: ${userName || 'Member'}`, 195, 20, { align: 'right' });
    doc.text(`Created: ${new Date(plan.created_at).toLocaleDateString()}`, 195, 27, { align: 'right' });
    doc.text(`Goal: ${plan.goal}`, 195, 34, { align: 'right' });

    let currentY = 56;

    // --- Profile Summary Box ---
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, currentY, 180, 36, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(...textDark);

    const colW = 45;
    // Row 1: Level & Schedule
    doc.setFont('helvetica', 'bold');
    doc.text('Fitness Level:', 20, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(plan.level, 20 + 24, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Schedule:', 20 + colW + 15, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(plan.schedule, 20 + colW + 35, currentY + 7);

    // Row 2: Biometrics (Age, Height, Weight) & Food Preference
    doc.setFont('helvetica', 'bold');
    doc.text('Biometrics:', 20, currentY + 17);
    doc.setFont('helvetica', 'normal');
    const bioText = [
      plan.age ? `Age: ${plan.age}` : '',
      plan.height ? `Ht: ${plan.height}` : '',
      plan.weight ? `Wt: ${plan.weight}` : '',
    ]
      .filter(Boolean)
      .join(' | ') || 'N/A';
    doc.text(bioText, 20 + 22, currentY + 17);

    doc.setFont('helvetica', 'bold');
    doc.text('Diet Style:', 20 + colW + 15, currentY + 17);
    doc.setFont('helvetica', 'normal');
    doc.text(plan.food_preference || 'Balanced', 20 + colW + 35, currentY + 17);

    // Row 3: Duration & Equipment
    doc.setFont('helvetica', 'bold');
    doc.text('Duration:', 20, currentY + 27);
    doc.setFont('helvetica', 'normal');
    doc.text(plan.workout_duration, 20 + 20, currentY + 27);

    doc.setFont('helvetica', 'bold');
    doc.text('Equipment:', 20 + colW + 15, currentY + 27);
    doc.setFont('helvetica', 'normal');
    const equipArr = Array.isArray(plan.equipment)
      ? plan.equipment
      : typeof (plan.equipment as any) === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(plan.equipment as any);
            return Array.isArray(parsed) ? parsed : [plan.equipment as any];
          } catch {
            return [plan.equipment as any];
          }
        })()
      : [];
    const equipStr = equipArr.join(', ') || 'No Equipment';
    doc.text(equipStr.length > 30 ? equipStr.substring(0, 30) + '...' : equipStr, 20 + colW + 38, currentY + 27);

    currentY += 44;

    // --- Workouts Section ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...darkBg);
    doc.text('Weekly Workout Routine', 15, currentY);

    // Emerald accent bar
    doc.setFillColor(...primaryColor);
    doc.rect(15, currentY + 2, 40, 1.5, 'F');
    currentY += 8;

    const daysList = Array.isArray(plan.workout_plan)
      ? plan.workout_plan
      : typeof (plan.workout_plan as any) === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(plan.workout_plan as any);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

    daysList.forEach((workoutDay) => {
      // Check if we need page break
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      // Day Title & Focus
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`${workoutDay.day}: ${workoutDay.title}`, 15, currentY);
      currentY += 5;

      if (workoutDay.focus) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Focus: ${workoutDay.focus}`, 15, currentY);
        currentY += 4;
      }

      // Table for exercises
      const exList = Array.isArray(workoutDay.exercises) ? workoutDay.exercises : [];
      const tableData = exList.map((ex, idx) => [
        `${idx + 1}. ${ex.name}`,
        ex.sets,
        ex.reps,
        ex.rest,
        ex.instructions || ex.tips || '-'
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: 15, right: 15 },
        head: [['Exercise', 'Sets', 'Reps', 'Rest', 'Execution & Form Cues']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [17, 24, 39],
          textColor: [248, 250, 252],
          fontSize: 8,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: 'bold' },
          1: { cellWidth: 16, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 'auto' },
        },
        didDrawPage: () => {
          // Footer
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${pageCount} | Generated by FITAI`, 105, 290, { align: 'center' });
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    // --- Recommendations Section ---
    if (currentY > 210) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...darkBg);
    doc.text('Coaching & Nutrition Recommendations', 15, currentY);
    doc.setFillColor(...secondaryColor);
    doc.rect(15, currentY + 2, 50, 1.5, 'F');
    currentY += 8;

    const safeRecs = plan.recommendations || ({} as any);
    const recs = [
      { title: 'Dynamic Warm-Up', text: safeRecs.warmup },
      { title: 'Cool-Down & Mobility', text: safeRecs.cooldown },
      { title: 'Weekly Progression Strategy', text: safeRecs.progression },
      { title: 'Recovery & Sleep Protocol', text: safeRecs.recovery },
      { title: 'Nutrition & Macro Guidance', text: safeRecs.nutrition },
    ];

    recs.forEach((rec) => {
      if (rec.text) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(rec.title, 15, currentY);
        currentY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const splitText = doc.splitTextToSize(rec.text, 180);
        doc.text(splitText, 15, currentY);
        currentY += splitText.length * 3.5 + 4;
      }
    });

    // Save PDF
    const cleanName = (userName || 'Member').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`FITAI_Fitness_Plan_${cleanName}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF generation error:', err);
    throw err;
  }
}
