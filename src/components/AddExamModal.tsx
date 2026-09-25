import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { SubjectType } from '../types';
import { Calendar, Clock, BookOpen, Layers } from 'lucide-react';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({ isOpen, onClose }) => {
  const { addExam, addScheduleBlock } = useStudy();

  const [mode, setMode] = useState<'exam' | 'session'>('exam');

  // Exam fields
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState<SubjectType>('Computer Science');
  const [examDate, setExamDate] = useState('2026-10-12T09:00');
  const [examRoom, setExamRoom] = useState('');
  const [examWeight, setExamWeight] = useState(30);
  const [examGrade, setExamGrade] = useState('A');
  const [examTopics, setExamTopics] = useState('Dynamic Programming, Graph Theory, NP-Completeness');

  // Schedule session fields
  const [blockTitle, setBlockTitle] = useState('');
  const [blockSubject, setBlockSubject] = useState<SubjectType>('Computer Science');
  const [blockDay, setBlockDay] = useState(1); // Monday
  const [blockStart, setBlockStart] = useState('10:00');
  const [blockEnd, setBlockEnd] = useState('11:30');
  const [blockType, setBlockType] = useState<any>('Deep Focus');
  const [blockNotes, setBlockNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'exam') {
      if (!examTitle) return;
      const topicList = examTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      addExam({
        subject: examSubject,
        title: examTitle,
        examDate: new Date(examDate).toISOString(),
        room: examRoom || undefined,
        weightPercentage: Number(examWeight) || 25,
        targetGrade: examGrade,
        preparationProgress: 15,
        topics: topicList,
        notificationHoursBefore: [72, 48, 24, 6]
      });
    } else {
      if (!blockTitle) return;
      addScheduleBlock({
        subject: blockSubject,
        title: blockTitle,
        dayOfWeek: Number(blockDay),
        startTime: blockStart,
        endTime: blockEnd,
        completed: false,
        type: blockType,
        notes: blockNotes || undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMode('exam')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                mode === 'exam'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Add Exam Deadline
            </button>
            <button
              onClick={() => setMode('session')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                mode === 'session'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Add Study Block
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === 'exam' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Molecular Genetics Midterm"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value as SubjectType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Exam Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Grade Target
                  </label>
                  <input
                    type="text"
                    value={examGrade}
                    onChange={(e) => setExamGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={examWeight}
                    onChange={(e) => setExamWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hall / Room
                  </label>
                  <input
                    type="text"
                    placeholder="Bldg 402"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Key Syllabus Topics (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={examTopics}
                  onChange={(e) => setExamTopics(e.target.value)}
                  placeholder="e.g. Chapter 4 proofs, Matrix transformations"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Integration Practice"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={blockSubject}
                    onChange={(e) => setBlockSubject(e.target.value as SubjectType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={blockDay}
                    onChange={(e) => setBlockDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={blockType}
                    onChange={(e) => setBlockType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Deep Focus">Deep Focus</option>
                    <option value="Active Recall">Active Recall</option>
                    <option value="Problem Set">Problem Set</option>
                    <option value="Peer Session">Peer Session</option>
                    <option value="Revision">Revision</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
            >
              {mode === 'exam' ? 'Save Exam Deadline' : 'Schedule Study Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
