export type SubjectType = 'Mathematics' | 'Computer Science' | 'Chemistry' | 'Biology' | 'Physics' | 'Economics' | 'Literature' | 'General';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ExamDeadline {
  id: string;
  subject: SubjectType;
  title: string;
  examDate: string; // ISO date string
  room?: string;
  weightPercentage: number;
  topics: string[];
  targetGrade: string;
  preparationProgress: number; // 0 - 100
  notificationHoursBefore: number[]; // e.g. [72, 24, 6, 1]
  notes?: string;
}

export interface RevisionTopic {
  id: string;
  subject: SubjectType;
  topicName: string;
  leitnerBox: 1 | 2 | 3 | 4 | 5; // Box 1 = 1d, 2 = 3d, 3 = 7d, 4 = 14d, 5 = 30d (Mastered)
  lastReviewedDate: string;
  nextReviewDate: string;
  masteryLevel: number; // 0 - 100
  keyRecallQuestion: string;
  answerSummary: string;
  retentionStreak: number;
  priority: PriorityLevel;
}

export interface ScheduleBlock {
  id: string;
  subject: SubjectType;
  title: string;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  completed: boolean;
  type: 'Lecture' | 'Deep Focus' | 'Active Recall' | 'Problem Set' | 'Peer Session' | 'Revision';
  notes?: string;
}

export interface StudyLogSession {
  id: string;
  subject: SubjectType;
  date: string;
  startHour: number; // 0 - 23
  durationMinutes: number;
  focusScore: number; // 1 - 10
  energyLevel: 'Low' | 'Moderate' | 'Peak';
  notes?: string;
  completedTasksCount: number;
}

export interface PeerUser {
  id: string;
  name: string;
  avatar: string;
  currentSubject: SubjectType;
  status: 'focusing' | 'break' | 'idle';
  currentTask: string;
  streakDays: number;
  totalStudyHours: number;
  minutesInCurrentSession: number;
  isOnline: boolean;
}

export interface PeerRoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  timestamp: string;
  isNote?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'exam_urgent' | 'revision_due' | 'peer_joined' | 'break_reminder' | 'streak_alert';
  read: boolean;
  actionUrl?: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface ChronotypeInsight {
  chronotype: string;
  peakSummary: string;
  optimalHours: {
    hourSlot: string;
    avgFocus: number;
    sessionsCount: number;
    efficiency: number;
    optimalFor: string;
    peak: boolean;
  }[];
  keyObservations: string[];
  smartRecommendations: {
    title: string;
    action: string;
    impact: string;
  }[];
  burnoutRisk: {
    level: 'Low' | 'Moderate' | 'High' | 'Low-Moderate';
    score: number;
    indicator: string;
  };
}
