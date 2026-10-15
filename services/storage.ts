
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Student,
  QuizAttempt,
  QuizResult,
} from '../types/quiz';
import { gradeQuiz } from '../utils/quizHelper';

const KEY = 'TRAC_NGHIEM_FULL_V3';

type StorageState = {
  student: Student | null;
  current: QuizAttempt | null;
  history: QuizResult[];
};

function emptyState(): StorageState {
  return {
    student: null,
    current: null,
    history: [],
  };
}

// Xếp hàng các thao tác đọc/ghi
let queue: Promise<unknown> = Promise.resolve();

function transaction<T>(work: () => Promise<T>): Promise<T> {
  const next = queue.then(work, work);

  queue = next.then(
    () => undefined,
    () => undefined
  );

  return next;
}

async function read(): Promise<StorageState> {
  const raw = await AsyncStorage.getItem(KEY);

  if (!raw) return emptyState();

  const parsed = JSON.parse(raw) as Partial<StorageState>;

  return {
    student: parsed.student ?? null,
    current: parsed.current ?? null,
    history: Array.isArray(parsed.history)
      ? parsed.history
      : [],
  };
}

async function write(state: StorageState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

// Lấy thông tin sinh viên
export function getStudent() {
  return transaction(async () => (await read()).student);
}

// Lưu thông tin sinh viên
export function saveStudent(student: Student) {
  return transaction(async () => {
    const state = await read();
    state.student = student;
    await write(state);
  });
}

// Lấy bài đang làm
export function getCurrent() {
  return transaction(async () => (await read()).current);
}

// Lấy lịch sử mới nhất trước
export function getHistory() {
  return transaction(async () => {
    const state = await read();

    return [...state.history].sort(
      (a, b) => b.submittedAt - a.submittedAt
    );
  });
}

// Bắt đầu bài mới, không ghi đè bài đang làm
export function startQuiz(attempt: QuizAttempt) {
  return transaction(async () => {
    const state = await read();

    if (state.current) return state.current;

    state.current = attempt;
    await write(state);

    return attempt;
  });
}

// Lưu một đáp án
export function saveAnswer(
  attemptId: string,
  questionId: string,
  choice: number
) {
  return transaction(async () => {
    const state = await read();
    const attempt = state.current;

    if (
      !attempt ||
      attempt.id !== attemptId ||
      Date.now() >= attempt.expiresAt ||
      !attempt.questionIds.includes(questionId) ||
      !Number.isInteger(choice) ||
      choice < 0 ||
      choice > 3
    ) {
      return false;
    }

    attempt.answers[questionId] = choice;

    await write(state);

    return true;
  });
}

// Nộp bài và lưu kết quả đúng một lần
export function submitQuiz(
  attemptId: string
): Promise<QuizResult | null> {
  return transaction(async () => {
    const state = await read();

    // Nếu đã nộp, trả về kết quả cũ
    const existing = state.history.find(
      result => result.id === attemptId
    );

    if (existing) return existing;

    const attempt = state.current;

    if (!attempt || attempt.id !== attemptId) {
      return null;
    }

    const submittedAt = Math.min(
      Date.now(),
      attempt.expiresAt
    );

    const result = gradeQuiz(attempt, submittedAt);

    state.history.unshift(result);
    state.current = null;

    await write(state);

    return result;
  });
}
