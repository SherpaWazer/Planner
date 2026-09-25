import { ExamDeadline, ScheduleBlock } from '../types';

export function exportToICS(exams: ExamDeadline[], scheduleBlocks: ScheduleBlock[]): void {
  const pad = (n: number): string => (n < 10 ? '0' + n : String(n));

  const formatDateToICS = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SynapsePlan//AI Student Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SynapsePlan Study & Exam Schedule',
  ];

  // Add Exams
  exams.forEach((exam) => {
    const examDate = new Date(exam.examDate);
    const endDate = new Date(examDate.getTime() + 2 * 60 * 60 * 1000); // 2h duration
    const now = new Date();

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:exam-${exam.id}@synapseplan.app`);
    icsContent.push(`DTSTAMP:${formatDateToICS(now)}`);
    icsContent.push(`DTSTART:${formatDateToICS(examDate)}`);
    icsContent.push(`DTEND:${formatDateToICS(endDate)}`);
    icsContent.push(`SUMMARY:🎯 EXAM: ${exam.title} (${exam.subject})`);
    icsContent.push(
      `DESCRIPTION:Weight: ${exam.weightPercentage}%\\nTarget Grade: ${exam.targetGrade}\\nTopics: ${exam.topics.join(', ')}`
    );
    if (exam.room) {
      icsContent.push(`LOCATION:${exam.room}`);
    }
    icsContent.push('PRIORITY:1');
    icsContent.push('BEGIN:VALARM');
    icsContent.push('TRIGGER:-PT24H');
    icsContent.push('ACTION:DISPLAY');
    icsContent.push(`DESCRIPTION:Reminder: Upcoming Exam tomorrow - ${exam.title}`);
    icsContent.push('END:VALARM');
    icsContent.push('END:VEVENT');
  });

  // Add Schedule Blocks for the next 7 days
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0-6

  scheduleBlocks.forEach((block) => {
    // Find the next date corresponding to this dayOfWeek
    const dayDiff = (block.dayOfWeek - currentDayOfWeek + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayDiff);

    const [startH, startM] = block.startTime.split(':').map(Number);
    const [endH, endM] = block.endTime.split(':').map(Number);

    const startDateTime = new Date(targetDate);
    startDateTime.setHours(startH, startM, 0, 0);

    const endDateTime = new Date(targetDate);
    endDateTime.setHours(endH, endM, 0, 0);

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:block-${block.id}-${dayDiff}@synapseplan.app`);
    icsContent.push(`DTSTAMP:${formatDateToICS(today)}`);
    icsContent.push(`DTSTART:${formatDateToICS(startDateTime)}`);
    icsContent.push(`DTEND:${formatDateToICS(endDateTime)}`);
    icsContent.push(`SUMMARY:📖 [Study] ${block.title} - ${block.subject}`);
    icsContent.push(`DESCRIPTION:Session Type: ${block.type}\\nNotes: ${block.notes || 'None'}`);
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `synapseplan-study-schedule-${new Date().toISOString().slice(0, 10)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
