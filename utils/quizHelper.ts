
import { questions } from '../data/questions';
import type {
  Topic,
  Student,
  QuizAttempt,
  QuizResult,
} from '../types/quiz';
// Thời gian làm bài (giây)
export const DURATION = 180;

export function topicName(topic: Topic): string {
  return topic === 'TOAN'
    ? 'Toán học cơ bản'
    : 'Tiếng Việt cơ bản';
}

export function formatTime(seconds: number): string {
  const value = Math.max(0, Math.floor(seconds));

  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const secs = String(value % 60).padStart(2, '0');

  return `${minutes}:${secs}`;
}

// Chọn 5 câu ngẫu nhiên không trùng nhau
export function createQuiz(
  topic: Topic,
  student: Student
): QuizAttempt {
  const pool = questions.filter(q => q.topic === topic);
// đk câu hỏi phải có ít nhất 5 câu
  if (pool.length < 5) {
    throw new Error('Chủ đề phải có ít nhất 10 câu hỏi.');
  }

  const shuffled = [...pool];

  // Trộn Fisher-Yates
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const now = Date.now();

  return {
    id: `${now}-${Math.random().toString(36).slice(2, 10)}`,
    topic,
    fullName: student.fullName.trim(),
    studentId: student.studentId.trim(),
    questionIds: shuffled.slice(0, 5).map(q => q.id),// 
    answers: {},
    startedAt: now,
    expiresAt: now + DURATION * 1000,
  };
}

// Chấm điểm khi nộp bài
export function gradeQuiz(
  attempt: QuizAttempt,
  submittedAt: number = Date.now()
): QuizResult {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  for (const id of attempt.questionIds) {
    const question = questions.find(q => q.id === id);

    if (!question) {
      throw new Error(`Không tìm thấy câu hỏi ${id}`);
    }

    const answer = attempt.answers[id];

    if (answer === undefined) {
      unanswered++;
    } else if (answer === question.correctAnswer) {
      correct++;
    } else {
      wrong++;
    }
  }

  return {
    ...attempt,
    submittedAt,
    correct,
    wrong,
    unanswered,
    score: correct * 2, // 2 điểm mỗi câu đúng
    usedSeconds: Math.min(
      DURATION,
      Math.max(
        0,
        Math.ceil((submittedAt - attempt.startedAt) / 1000)
      )
    ),
  };
}
