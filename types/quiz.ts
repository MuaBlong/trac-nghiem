
export type Topic = 'TOAN' | 'TIENGVIET';

export type Question = {
  id: string;
  topic: Topic;
  content: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
};

export type Student = {
  fullName: string;
  studentId: string;
};

export type QuizAttempt = {
  id: string;
  topic: Topic;
  fullName: string;
  studentId: string;
  questionIds: string[];
  answers: Record<string, number>;
  startedAt: number;
  expiresAt: number;
};

export type QuizResult = QuizAttempt & {
  submittedAt: number;
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  usedSeconds: number;
};
