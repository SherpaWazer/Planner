import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ExamDeadline,
  RevisionTopic,
  ScheduleBlock,
  StudyLogSession,
  PeerUser,
  PeerRoomMessage,
  NotificationItem,
  ChronotypeInsight,
  SubjectType
} from '../types';
import { playChime } from '../utils/audio';

interface StudyContextType {
  // Exams
  exams: ExamDeadline[];
  addExam: (exam: Omit<ExamDeadline, 'id'>) => void;
  updateExam: (id: string, updates: Partial<ExamDeadline>) => void;
  deleteExam: (id: string) => void;

  // Revision / Spaced Repetition
  revisionTopics: RevisionTopic[];
  updateTopicBox: (id: string, newBox: 1 | 2 | 3 | 4 | 5) => void;
  markTopicReviewed: (id: string, masteryDelta: number) => void;
  addRevisionTopic: (topic: Omit<RevisionTopic, 'id'>) => void;
  applyAIRevisionPlan: (planItems: any[]) => void;

  // Schedule
  scheduleBlocks: ScheduleBlock[];
  toggleBlockComplete: (id: string) => void;
  addScheduleBlock: (block: Omit<ScheduleBlock, 'id'>) => void;
  deleteScheduleBlock: (id: string) => void;
  autoOptimizeSchedule: () => void;

  // Productivity Logs & AI
  studyLogs: StudyLogSession[];
  logSession: (session: Omit<StudyLogSession, 'id'>) => void;
  aiInsights: ChronotypeInsight | null;
  loadingInsights: boolean;
  fetchAIProductivityInsights: () => Promise<void>;
  applyRecommendation: (recommendationTitle: string) => void;

  // Pomodoro Focus Engine
  pomodoro: {
    mode: 'focus' | 'short_break' | 'long_break';
    timeLeft: number;
    isRunning: boolean;
    activeTask: string;
    selectedSubject: SubjectType;
    completedCycles: number;
  };
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  setPomodoroTask: (task: string, subject: SubjectType) => void;
  switchPomodoroMode: (mode: 'focus' | 'short_break' | 'long_break') => void;

  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  browserNotificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<void>;
  testNotificationChime: () => void;

  // Collaborative Peer Lounge
  peers: PeerUser[];
  peerMessages: PeerRoomMessage[];
  groupCohortGoalHours: number;
  cohortCompletedHours: number;
  sendPeerMessage: (text: string, isNote?: boolean) => void;
  updateMyStatus: (status: 'focusing' | 'break' | 'idle', task: string) => void;
  myStatus: { status: 'focusing' | 'break' | 'idle'; task: string };

  // Micro-SaaS State
  userTier: 'free' | 'pro' | 'campus';
  setUserTier: (tier: 'free' | 'pro' | 'campus') => void;
  currentSemester: string;
  setCurrentSemester: (sem: string) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Initial Seed Data
const initialExams: ExamDeadline[] = [
  {
    id: 'exam-1',
    subject: 'Computer Science',
    title: 'Algorithms & Complexity (CS 301)',
    examDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // ~3.1 days
    room: 'Turing Hall 402',
    weightPercentage: 35,
    topics: ['Dynamic Programming', 'Graph Theory (Dijkstra, A*)', 'NP-Completeness', 'Divide & Conquer'],
    targetGrade: 'A',
    preparationProgress: 68,
    notificationHoursBefore: [72, 48, 24, 6, 2],
    notes: 'Focus on Bellman-Ford proofs and 0/1 Knapsack recurrence relations.'
  },
  {
    id: 'exam-2',
    subject: 'Mathematics',
    title: 'Linear Algebra & Vector Spaces',
    examDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // ~6.3 days
    room: 'Euler Science Bldg B12',
    weightPercentage: 40,
    topics: ['Eigenvalues & Eigenvectors', 'Orthogonal Projections', 'Singular Value Decomposition', 'Matrix Diagonalization'],
    targetGrade: 'A+',
    preparationProgress: 52,
    notificationHoursBefore: [72, 48, 24, 12],
    notes: 'Memorize Gram-Schmidt orthogonalization steps.'
  },
  {
    id: 'exam-3',
    subject: 'Chemistry',
    title: 'Organic Chemistry II Mechanisms',
    examDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    room: 'Curie Lab 108',
    weightPercentage: 30,
    topics: ['Electrophilic Aromatic Substitution', 'Aldol & Claisen Condensations', 'Grignard Reagents', 'NMR Spectroscopy'],
    targetGrade: 'A',
    preparationProgress: 40,
    notificationHoursBefore: [96, 48, 24],
    notes: 'Draw out 15 synthesis pathways from scratch.'
  },
  {
    id: 'exam-4',
    subject: 'Biology',
    title: 'Molecular Genetics & CRISPR Midterm',
    examDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    room: 'Darwin Lecture Hall',
    weightPercentage: 25,
    topics: ['Transcription Factors', 'CRISPR-Cas9 Editing', 'Epigenetic Methylation', 'Translation Ribosomes'],
    targetGrade: 'A',
    preparationProgress: 25,
    notificationHoursBefore: [72, 24],
    notes: 'Review lab protocols on restriction enzymes.'
  }
];

const initialRevisionTopics: RevisionTopic[] = [
  {
    id: 'rev-1',
    subject: 'Computer Science',
    topicName: 'Dijkstra & Prim-Jarnik Algorithms',
    leitnerBox: 2,
    lastReviewedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    masteryLevel: 75,
    keyRecallQuestion: 'Why does standard Dijkstra fail on graphs with negative edge weights?',
    answerSummary: 'Because greedy vertex finalization assumes added paths are strictly monotonic in weight.',
    retentionStreak: 3,
    priority: 'High'
  },
  {
    id: 'rev-2',
    subject: 'Mathematics',
    topicName: 'Eigenvalue Diagonalization Conditions',
    leitnerBox: 1,
    lastReviewedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    masteryLevel: 45,
    keyRecallQuestion: 'When is an n x n matrix guaranteed to be diagonalizable?',
    answerSummary: 'When it has n linearly independent eigenvectors, or if all n eigenvalues are distinct.',
    retentionStreak: 1,
    priority: 'Critical'
  },
  {
    id: 'rev-3',
    subject: 'Computer Science',
    topicName: '0/1 Knapsack Dynamic Programming',
    leitnerBox: 3,
    lastReviewedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    masteryLevel: 82,
    keyRecallQuestion: 'What is the state transition recurrence for the 0/1 knapsack table?',
    answerSummary: 'dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]) if wt[i] <= w.',
    retentionStreak: 4,
    priority: 'High'
  },
  {
    id: 'rev-4',
    subject: 'Chemistry',
    topicName: 'Aldol Addition vs. Condensation Elimination',
    leitnerBox: 1,
    lastReviewedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    masteryLevel: 50,
    keyRecallQuestion: 'What catalyst conditions push aldol addition to undergo dehydrative elimination?',
    answerSummary: 'Heating with acid or strong base favors conjugated alpha-beta unsaturated carbonyl.',
    retentionStreak: 2,
    priority: 'Critical'
  },
  {
    id: 'rev-5',
    subject: 'Mathematics',
    topicName: 'Gram-Schmidt Orthogonalization Process',
    leitnerBox: 4,
    lastReviewedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    masteryLevel: 92,
    keyRecallQuestion: 'How is vector u_k computed from basis v_k and previously orthogonalized vectors?',
    answerSummary: 'Subtract the projections of v_k onto all previous u_j vectors: u_k = v_k - sum(proj_uj(v_k)).',
    retentionStreak: 6,
    priority: 'Medium'
  },
  {
    id: 'rev-6',
    subject: 'Biology',
    topicName: 'CRISPR Cas9 sgRNA and PAM Site Sequence',
    leitnerBox: 5,
    lastReviewedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    masteryLevel: 98,
    keyRecallQuestion: 'What is the required Protospacer Adjacent Motif (PAM) sequence for SpCas9?',
    answerSummary: '5-NGG-3 located directly 3 prime of the 20-nucleotide target sequence.',
    retentionStreak: 8,
    priority: 'Low'
  }
];

const initialScheduleBlocks: ScheduleBlock[] = [
  {
    id: 'b-1',
    subject: 'Computer Science',
    title: 'Dynamic Programming Proofs & Knapsack',
    dayOfWeek: 1, // Mon
    startTime: '09:00',
    endTime: '11:00',
    completed: true,
    type: 'Deep Focus',
    notes: 'Cognitive peak slot - heavy algorithmic reasoning.'
  },
  {
    id: 'b-2',
    subject: 'Mathematics',
    title: 'Linear Algebra Eigenvalues Problem Set',
    dayOfWeek: 1,
    startTime: '16:00',
    endTime: '18:00',
    completed: true,
    type: 'Problem Set',
    notes: 'Exercises 4.1 through 4.5.'
  },
  {
    id: 'b-3',
    subject: 'Chemistry',
    title: 'Electrophilic Aromatic Synthesis Flashcards',
    dayOfWeek: 2, // Tue
    startTime: '10:00',
    endTime: '11:30',
    completed: false,
    type: 'Active Recall',
    notes: 'Spaced repetition box 1 review.'
  },
  {
    id: 'b-4',
    subject: 'Computer Science',
    title: 'Peer Study Session: Graph Algorithms Mock',
    dayOfWeek: 2,
    startTime: '19:30',
    endTime: '21:30',
    completed: false,
    type: 'Peer Session',
    notes: 'Collaborative coding with Maya and Liam in Study Room.'
  },
  {
    id: 'b-5',
    subject: 'Mathematics',
    title: 'Matrix Diagonalization & Orthogonal Basis',
    dayOfWeek: 3, // Wed
    startTime: '09:30',
    endTime: '11:45',
    completed: false,
    type: 'Deep Focus',
    notes: 'Exam priority chapter 5.'
  },
  {
    id: 'b-6',
    subject: 'Biology',
    title: 'CRISPR Cas9 Mechanisms & Journal Reading',
    dayOfWeek: 4, // Thu
    startTime: '14:00',
    endTime: '15:30',
    completed: false,
    type: 'Revision',
    notes: 'Summarize key experimental controls.'
  },
  {
    id: 'b-7',
    subject: 'Computer Science',
    title: 'Full Timed Mock Exam: Algorithms CS301',
    dayOfWeek: 5, // Fri
    startTime: '09:00',
    endTime: '12:00',
    completed: false,
    type: 'Deep Focus',
    notes: 'Simulate strict 3-hour exam conditions without notes.'
  },
  {
    id: 'b-8',
    subject: 'Chemistry',
    title: 'Organic Synthesis Reaction Roadmaps',
    dayOfWeek: 6, // Sat
    startTime: '10:30',
    endTime: '12:30',
    completed: false,
    type: 'Active Recall',
    notes: 'Draw out all aldol & carbonyl mechanisms.'
  }
];

const initialStudyLogs: StudyLogSession[] = [
  { id: 'log-1', subject: 'Computer Science', date: '2026-09-20', startHour: 9, durationMinutes: 110, focusScore: 9.5, energyLevel: 'Peak', completedTasksCount: 4 },
  { id: 'log-2', subject: 'Mathematics', date: '2026-09-20', startHour: 16, durationMinutes: 90, focusScore: 8.2, energyLevel: 'Moderate', completedTasksCount: 2 },
  { id: 'log-3', subject: 'Chemistry', date: '2026-09-21', startHour: 10, durationMinutes: 80, focusScore: 9.0, energyLevel: 'Peak', completedTasksCount: 3 },
  { id: 'log-4', subject: 'Biology', date: '2026-09-21', startHour: 13, durationMinutes: 60, focusScore: 5.8, energyLevel: 'Low', completedTasksCount: 1 },
  { id: 'log-5', subject: 'Computer Science', date: '2026-09-22', startHour: 20, durationMinutes: 105, focusScore: 9.2, energyLevel: 'Peak', completedTasksCount: 4 },
  { id: 'log-6', subject: 'Mathematics', date: '2026-09-22', startHour: 14, durationMinutes: 75, focusScore: 6.4, energyLevel: 'Low', completedTasksCount: 2 },
  { id: 'log-7', subject: 'Chemistry', date: '2026-09-23', startHour: 9, durationMinutes: 95, focusScore: 9.3, energyLevel: 'Peak', completedTasksCount: 3 },
  { id: 'log-8', subject: 'Computer Science', date: '2026-09-23', startHour: 19, durationMinutes: 85, focusScore: 8.9, energyLevel: 'Peak', completedTasksCount: 2 },
  { id: 'log-9', subject: 'Mathematics', date: '2026-09-24', startHour: 11, durationMinutes: 90, focusScore: 8.7, energyLevel: 'Peak', completedTasksCount: 3 },
];

const initialPeers: PeerUser[] = [
  {
    id: 'peer-1',
    name: 'Maya Kowalski',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    currentSubject: 'Chemistry',
    status: 'focusing',
    currentTask: 'Aldol Addition reaction mechanisms',
    streakDays: 14,
    totalStudyHours: 42.5,
    minutesInCurrentSession: 38,
    isOnline: true
  },
  {
    id: 'peer-2',
    name: 'Liam Chen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    currentSubject: 'Computer Science',
    status: 'focusing',
    currentTask: 'Graph flow & Dijkstra practice set',
    streakDays: 9,
    totalStudyHours: 36.0,
    minutesInCurrentSession: 22,
    isOnline: true
  },
  {
    id: 'peer-3',
    name: 'Aisha Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    currentSubject: 'Mathematics',
    status: 'break',
    currentTask: '5m stretch & hydration break',
    streakDays: 21,
    totalStudyHours: 54.2,
    minutesInCurrentSession: 5,
    isOnline: true
  },
  {
    id: 'peer-4',
    name: 'Carlos Mendez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    currentSubject: 'Biology',
    status: 'focusing',
    currentTask: 'CRISPR Cas9 journal notes',
    streakDays: 6,
    totalStudyHours: 24.8,
    minutesInCurrentSession: 45,
    isOnline: true
  },
  {
    id: 'peer-5',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    currentSubject: 'Mathematics',
    status: 'idle',
    currentTask: 'Reviewing past exam formulas',
    streakDays: 11,
    totalStudyHours: 31.4,
    minutesInCurrentSession: 0,
    isOnline: false
  }
];

const initialPeerMessages: PeerRoomMessage[] = [
  {
    id: 'm-1',
    senderId: 'peer-1',
    senderName: 'Maya Kowalski',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    text: 'Hey study group! Jumping into a 50m sprint on Organic Mechanisms. Let me know if anyone wants to test each other on carbon nucleophiles afterward.',
    timestamp: '25m ago'
  },
  {
    id: 'm-2',
    senderId: 'peer-2',
    senderName: 'Liam Chen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    text: '📌 Shared Mnemonic: For Dijkstra vs Bellman-Ford: "Dijkstra Dashes Fast (Greedy O(E log V)), Bellman Breaks Bads (Negative cycles detected O(VE))". Pinning this for CS301!',
    timestamp: '18m ago',
    isNote: true
  },
  {
    id: 'm-3',
    senderId: 'peer-3',
    senderName: 'Aisha Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    text: 'Just finished my 3rd Pomodoro block of Linear Algebra! Coffee break now ☕',
    timestamp: '5m ago'
  }
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🔴 Critical Exam Approaching: CS 301',
    message: 'Algorithms & Complexity Final is in ~3 days. Spaced review for Dynamic Programming is due today.',
    timestamp: '10m ago',
    type: 'exam_urgent',
    read: false,
    urgency: 'high'
  },
  {
    id: 'notif-2',
    title: '🧠 Leitner Box Review Due',
    message: 'Matrix Diagonalization (Math) is scheduled for today’s active recall session.',
    timestamp: '1h ago',
    type: 'revision_due',
    read: false,
    urgency: 'medium'
  },
  {
    id: 'notif-3',
    title: '👥 Study Cohort Milestone: 78% Reached',
    message: 'The Late Night STEM cohort has logged 78.5 of 100 study hours this week!',
    timestamp: '2h ago',
    type: 'peer_joined',
    read: true,
    urgency: 'low'
  }
];

const defaultFallbackInsights: ChronotypeInsight = {
  chronotype: 'Bimodal Morning & Evening Zenith',
  peakSummary: 'Your cognitive retention peaks from 9:00 AM – 12:00 PM and 7:30 PM – 10:00 PM with an average focus score of 9.3/10.',
  optimalHours: [
    { hourSlot: '07:00 - 09:00', avgFocus: 7.8, sessionsCount: 14, efficiency: 82, optimalFor: 'Flashcards & Concept Review', peak: false },
    { hourSlot: '09:00 - 12:00', avgFocus: 9.4, sessionsCount: 32, efficiency: 96, optimalFor: 'Heavy Analytical & Problem Solving (Calculus, Algorithms)', peak: true },
    { hourSlot: '13:00 - 15:00', avgFocus: 6.2, sessionsCount: 18, efficiency: 64, optimalFor: 'Light Reading or Post-Lunch Break', peak: false },
    { hourSlot: '16:00 - 18:30', avgFocus: 8.5, sessionsCount: 26, efficiency: 88, optimalFor: 'Collaborative Study & Mock Exams', peak: false },
    { hourSlot: '19:30 - 22:00', avgFocus: 9.1, sessionsCount: 29, efficiency: 93, optimalFor: 'Synthesis, Coding & Active Recall Writing', peak: true },
    { hourSlot: '22:30 - 00:30', avgFocus: 5.7, sessionsCount: 11, efficiency: 58, optimalFor: 'Diminishing Returns (Sleep Recommended)', peak: false }
  ],
  keyObservations: [
    '34% higher retention on quantitative subjects when studied before noon compared to afternoon slots.',
    'Post-lunch dip observed between 1:00 PM and 2:30 PM: average focus drops by 32%.',
    'Spaced repetition sessions scheduled within 24h of learning demonstrate a 91% topic mastery rate on mock tests.'
  ],
  smartRecommendations: [
    {
      title: 'Shift Quantitative Heavy Sessions to Morning Block',
      action: 'Move Organic Chemistry and Linear Algebra from 2:00 PM to 09:30 AM.',
      impact: '+24% retention velocity and 35 fewer minutes needed per topic.'
    },
    {
      title: 'Implement 15m Reset at 1:30 PM',
      action: 'Replace low-efficiency study at 1:30 PM with a walk or non-screen recharge.',
      impact: 'Prevents mid-afternoon burnout and accelerates 4:00 PM study readiness.'
    },
    {
      title: 'Evening Synthesis Lock-In',
      action: 'Reserve 8:00 PM – 9:30 PM exclusively for self-testing flashcards & summary sheets.',
      impact: 'Leverages memory consolidation before sleep cycle.'
    }
  ],
  burnoutRisk: {
    level: 'Low-Moderate',
    score: 28,
    indicator: 'Healthy study/break ratio with minor sleep-boundary overshoots on Thursday nights.'
  }
};

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage hydrated states
  const [exams, setExams] = useState<ExamDeadline[]>(() => {
    const saved = localStorage.getItem('synapse_exams');
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [revisionTopics, setRevisionTopics] = useState<RevisionTopic[]>(() => {
    const saved = localStorage.getItem('synapse_revision');
    return saved ? JSON.parse(saved) : initialRevisionTopics;
  });

  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(() => {
    const saved = localStorage.getItem('synapse_schedule');
    return saved ? JSON.parse(saved) : initialScheduleBlocks;
  });

  const [studyLogs, setStudyLogs] = useState<StudyLogSession[]>(() => {
    const saved = localStorage.getItem('synapse_logs');
    return saved ? JSON.parse(saved) : initialStudyLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('synapse_notifs');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [peers, setPeers] = useState<PeerUser[]>(initialPeers);
  const [peerMessages, setPeerMessages] = useState<PeerRoomMessage[]>(initialPeerMessages);
  const [cohortCompletedHours, setCohortCompletedHours] = useState(78.5);
  const groupCohortGoalHours = 100;

  const [myStatus, setMyStatus] = useState<{ status: 'focusing' | 'break' | 'idle'; task: string }>({
    status: 'focusing',
    task: 'Dynamic Programming Proofs'
  });

  const [userTier, setUserTier] = useState<'free' | 'pro' | 'campus'>('pro');
  const [currentSemester, setCurrentSemester] = useState('Fall 2026 Semester');

  // Pomodoro Focus state
  const [pomodoro, setPomodoro] = useState<{
    mode: 'focus' | 'short_break' | 'long_break';
    timeLeft: number; // in seconds
    isRunning: boolean;
    activeTask: string;
    selectedSubject: SubjectType;
    completedCycles: number;
  }>({
    mode: 'focus',
    timeLeft: 25 * 60,
    isRunning: false,
    activeTask: 'Algorithms & Complexity Proofs',
    selectedSubject: 'Computer Science',
    completedCycles: 3
  });

  // AI Productivity Insights state
  const [aiInsights, setAiInsights] = useState<ChronotypeInsight | null>(defaultFallbackInsights);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('synapse_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('synapse_revision', JSON.stringify(revisionTopics));
  }, [revisionTopics]);

  useEffect(() => {
    localStorage.setItem('synapse_schedule', JSON.stringify(scheduleBlocks));
  }, [scheduleBlocks]);

  useEffect(() => {
    localStorage.setItem('synapse_logs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem('synapse_notifs', JSON.stringify(notifications));
  }, [notifications]);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Automated Exam Watchdog & Reminders interval
  useEffect(() => {
    const checkDeadlines = () => {
      const now = Date.now();
      exams.forEach((exam) => {
        const examTime = new Date(exam.examDate).getTime();
        const diffHours = (examTime - now) / (1000 * 60 * 60);

        // If exam is within 48 hours and hasn't triggered recent critical notif
        if (diffHours > 0 && diffHours <= 48) {
          const alreadyNotified = notifications.some(
            (n) => n.title.includes(exam.title) && n.urgency === 'high'
          );
          if (!alreadyNotified) {
            const newNotif: NotificationItem = {
              id: `notif-auto-${Date.now()}-${exam.id}`,
              title: `🚨 Urgent: ${exam.title} in ${Math.round(diffHours)} Hours`,
              message: `Exam weight is ${exam.weightPercentage}%. Review final recall flashcards and formula cheat sheets now.`,
              timestamp: 'Just now',
              type: 'exam_urgent',
              read: false,
              urgency: 'high'
            };
            setNotifications((prev) => [newNotif, ...prev]);
            playChime('urgent_alert');

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`🚨 Urgent: ${exam.title}`, {
                body: `Only ${Math.round(diffHours)} hours remaining until ${exam.title}!`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [exams, notifications]);

  // Pomodoro Ticking Engine
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomodoro.isRunning && pomodoro.timeLeft > 0) {
      timer = setInterval(() => {
        setPomodoro((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (pomodoro.isRunning && pomodoro.timeLeft === 0) {
      // Phase Complete!
      if (pomodoro.mode === 'focus') {
        playChime('pomodoro_complete');
        // Log study session automatically
        logSession({
          subject: pomodoro.selectedSubject,
          date: new Date().toISOString().slice(0, 10),
          startHour: new Date().getHours(),
          durationMinutes: 25,
          focusScore: 9.0,
          energyLevel: 'Peak',
          completedTasksCount: 1,
          notes: `Pomodoro session: ${pomodoro.activeTask}`
        });

        // Add to peer cohort completed hours
        setCohortCompletedHours((prev) => Math.min(groupCohortGoalHours, +(prev + 0.42).toFixed(1)));

        // Send alert
        const newNotif: NotificationItem = {
          id: `pomodoro-${Date.now()}`,
          title: '🎉 Focus Sprint Completed!',
          message: `Great job on "${pomodoro.activeTask}"! Take a well-deserved 5-minute break.`,
          timestamp: 'Just now',
          type: 'break_reminder',
          read: false,
          urgency: 'medium'
        };
        setNotifications((prev) => [newNotif, ...prev]);

        setPomodoro((prev) => ({
          ...prev,
          mode: 'short_break',
          timeLeft: 5 * 60,
          completedCycles: prev.completedCycles + 1,
          isRunning: true
        }));
      } else {
        // Break finished
        playChime('break_start');
        setPomodoro((prev) => ({
          ...prev,
          mode: 'focus',
          timeLeft: 25 * 60,
          isRunning: false
        }));
      }
    }
    return () => clearInterval(timer);
  }, [pomodoro.isRunning, pomodoro.timeLeft, pomodoro.mode]);

  // Exam actions
  const addExam = (examData: Omit<ExamDeadline, 'id'>) => {
    const newExam: ExamDeadline = {
      ...examData,
      id: `exam-${Date.now()}`
    };
    setExams((prev) => [...prev, newExam]);
    playChime('success');
  };

  const updateExam = (id: string, updates: Partial<ExamDeadline>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Revision actions
  const updateTopicBox = (id: string, newBox: 1 | 2 | 3 | 4 | 5) => {
    const daysToAdd = [1, 3, 7, 14, 30][newBox - 1];
    setRevisionTopics((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
          return {
            ...t,
            leitnerBox: newBox,
            lastReviewedDate: new Date().toISOString(),
            nextReviewDate: nextDate,
            masteryLevel: Math.min(100, t.masteryLevel + 12),
            retentionStreak: t.retentionStreak + 1
          };
        }
        return t;
      })
    );
    playChime('study_ping');
  };

  const markTopicReviewed = (id: string, masteryDelta: number) => {
    setRevisionTopics((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextBox = masteryDelta > 0 ? (Math.min(5, t.leitnerBox + 1) as 1 | 2 | 3 | 4 | 5) : (Math.max(1, t.leitnerBox - 1) as 1 | 2 | 3 | 4 | 5);
          const daysToAdd = [1, 3, 7, 14, 30][nextBox - 1];
          return {
            ...t,
            leitnerBox: nextBox,
            lastReviewedDate: new Date().toISOString(),
            nextReviewDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString(),
            masteryLevel: Math.max(0, Math.min(100, t.masteryLevel + masteryDelta)),
            retentionStreak: masteryDelta > 0 ? t.retentionStreak + 1 : 0
          };
        }
        return t;
      })
    );
    playChime('study_ping');
  };

  const addRevisionTopic = (topicData: Omit<RevisionTopic, 'id'>) => {
    const newTopic: RevisionTopic = {
      ...topicData,
      id: `rev-${Date.now()}`
    };
    setRevisionTopics((prev) => [newTopic, ...prev]);
    playChime('success');
  };

  const applyAIRevisionPlan = (planItems: any[]) => {
    const newTopics: RevisionTopic[] = planItems.map((item, idx) => ({
      id: `rev-ai-${Date.now()}-${idx}`,
      subject: item.subject || 'General',
      topicName: item.topic || `Topic ${idx + 1}`,
      leitnerBox: 1,
      lastReviewedDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + (item.recommendedDayOffset || 1) * 24 * 60 * 60 * 1000).toISOString(),
      masteryLevel: 20,
      keyRecallQuestion: `Explain the fundamental theorem and active recall framework for ${item.topic}.`,
      answerSummary: `Applied technique: ${item.recallTechnique || 'Feynman method'} (${item.phase || 'Concept Mastery'}).`,
      retentionStreak: 0,
      priority: item.priority || 'High'
    }));

    setRevisionTopics((prev) => [...newTopics, ...prev]);
    playChime('success');
  };

  // Schedule actions
  const toggleBlockComplete = (id: string) => {
    setScheduleBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
    playChime('study_ping');
  };

  const addScheduleBlock = (blockData: Omit<ScheduleBlock, 'id'>) => {
    const newBlock: ScheduleBlock = {
      ...blockData,
      id: `b-${Date.now()}`
    };
    setScheduleBlocks((prev) => [...prev, newBlock]);
  };

  const deleteScheduleBlock = (id: string) => {
    setScheduleBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const autoOptimizeSchedule = () => {
    // Reorders and fills empty gaps with highest-priority upcoming exam topics
    const urgentExams = [...exams].sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );

    if (urgentExams.length > 0) {
      const topExam = urgentExams[0];
      const newBlock: ScheduleBlock = {
        id: `auto-opt-${Date.now()}`,
        subject: topExam.subject,
        title: `AI Sprint: ${topExam.title} (Spaced Practice)`,
        dayOfWeek: new Date().getDay(),
        startTime: '10:00',
        endTime: '11:45',
        completed: false,
        type: 'Active Recall',
        notes: 'Auto-scheduled based on cognitive peak hours & exam countdown.'
      };
      setScheduleBlocks((prev) => [...prev, newBlock]);
      playChime('success');
    }
  };

  // Study log
  const logSession = (sessionData: Omit<StudyLogSession, 'id'>) => {
    const newSession: StudyLogSession = {
      ...sessionData,
      id: `log-${Date.now()}`
    };
    setStudyLogs((prev) => [newSession, ...prev]);
  };

  // AI Productivity Insights fetching via server-side endpoint
  const fetchAIProductivityInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/ai/productivity-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyLogs,
          studentGoals: {
            targetWeeklyHours: 25,
            primaryGoal: 'Achieve 3.9+ GPA and master spaced repetition',
            chronotypePreference: 'Morning & evening focus'
          },
          exams
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.chronotype && Array.isArray(data.optimalHours)) {
          setAiInsights(data);
          return;
        }
      }
      // If response was not ok or missing format, retain valid insights
      setAiInsights((prev) => prev || defaultFallbackInsights);
    } catch {
      // Graceful network or offline fallback
      setAiInsights((prev) => prev || defaultFallbackInsights);
    } finally {
      setLoadingInsights(false);
    }
  }, [studyLogs, exams]);

  // Auto-fetch insights on start if null
  useEffect(() => {
    if (!aiInsights) {
      fetchAIProductivityInsights();
    }
  }, []);

  const applyRecommendation = (recommendationTitle: string) => {
    // 1-click schedule alignment based on AI recommendation
    const optimizedBlock: ScheduleBlock = {
      id: `ai-aligned-${Date.now()}`,
      subject: 'Computer Science',
      title: 'AI Peak Slot: Dynamic Programming Mastery',
      dayOfWeek: new Date().getDay(),
      startTime: '09:15',
      endTime: '11:15',
      completed: false,
      type: 'Deep Focus',
      notes: `Aligned with Chronotype recommendation: ${recommendationTitle}`
    };
    setScheduleBlocks((prev) => [optimizedBlock, ...prev]);
    playChime('success');
  };

  // Pomodoro controls
  const startPomodoro = () => setPomodoro((prev) => ({ ...prev, isRunning: true }));
  const pausePomodoro = () => setPomodoro((prev) => ({ ...prev, isRunning: false }));
  const resetPomodoro = () =>
    setPomodoro((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.mode === 'focus' ? 25 * 60 : prev.mode === 'short_break' ? 5 * 60 : 15 * 60
    }));

  const setPomodoroTask = (task: string, subject: SubjectType) => {
    setPomodoro((prev) => ({ ...prev, activeTask: task, selectedSubject: subject }));
  };

  const switchPomodoroMode = (mode: 'focus' | 'short_break' | 'long_break') => {
    const times = {
      focus: 25 * 60,
      short_break: 5 * 60,
      long_break: 15 * 60
    };
    setPomodoro((prev) => ({
      ...prev,
      mode,
      timeLeft: times[mode],
      isRunning: false
    }));
  };

  // Notifications controls
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserNotificationsEnabled(perm === 'granted');
        if (perm === 'granted') {
          playChime('success');
          new Notification('SynapsePlan Notifications Activated', {
            body: 'You will receive timely automated countdown alerts for upcoming exams and revision intervals.',
            icon: '/favicon.ico'
          });
        }
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  const testNotificationChime = () => {
    playChime('urgent_alert');
  };

  // Collaborative Peer Lounge
  const sendPeerMessage = (text: string, isNote: boolean = false) => {
    const newMsg: PeerRoomMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'You (Alex)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text,
      timestamp: 'Just now',
      isNote
    };
    setPeerMessages((prev) => [...prev, newMsg]);
    playChime('study_ping');
  };

  const updateMyStatus = (status: 'focusing' | 'break' | 'idle', task: string) => {
    setMyStatus({ status, task });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <StudyContext.Provider
      value={{
        exams,
        addExam,
        updateExam,
        deleteExam,
        revisionTopics,
        updateTopicBox,
        markTopicReviewed,
        addRevisionTopic,
        applyAIRevisionPlan,
        scheduleBlocks,
        toggleBlockComplete,
        addScheduleBlock,
        deleteScheduleBlock,
        autoOptimizeSchedule,
        studyLogs,
        logSession,
        aiInsights,
        loadingInsights,
        fetchAIProductivityInsights,
        applyRecommendation,
        pomodoro,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        setPomodoroTask,
        switchPomodoroMode,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        browserNotificationsEnabled,
        requestNotificationPermission,
        testNotificationChime,
        peers,
        peerMessages,
        groupCohortGoalHours,
        cohortCompletedHours,
        sendPeerMessage,
        updateMyStatus,
        myStatus,
        userTier,
        setUserTier,
        currentSemester,
        setCurrentSemester
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
