
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import AnswerOption from '../components/AnswerOption';
import { questions } from '../data/questions';
import {
  getCurrent,
  saveAnswer,
  submitQuiz,
} from '../services/storage';
import type { QuizAttempt } from '../types/quiz';
import {
  formatTime,
  topicName,
} from '../utils/quizHelper';

export default function QuizScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(180);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const attemptRef = useRef<QuizAttempt | null>(null);
  const finishing = useRef(false);
  const writes = useRef<Promise<unknown>>(Promise.resolve());

  // Nộp bài: chỉ thực hiện một lần
  async function finish() {
    const current = attemptRef.current;

    if (!current || finishing.current) return;

    finishing.current = true;
    setConfirm(false);

    try {
      // Chờ các đáp án đang lưu hoàn thành
      await writes.current;

      const result = await submitQuiz(current.id);

      if (result) {
        router.replace({
          pathname: '/result',
          params: { id: result.id },
        });
      } else {
        setError('Không tìm thấy kết quả.');
        finishing.current = false;
      }
    } catch (e) {
      console.error(e);
      setError('Nộp bài thất bại. Hãy thử lại.');
      finishing.current = false;
    }
  }

  // Khôi phục bài đang làm
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const saved = await getCurrent();

        if (!active) return;

        if (saved && saved.id === id) {
          attemptRef.current = saved;
          setAttempt(saved);

          setRemaining(
            Math.max(
              0,
              Math.ceil((saved.expiresAt - Date.now()) / 1000)
            )
          );

          if (Date.now() >= saved.expiresAt) {
            void finish();
          }
        } else {
          setError('Không tìm thấy bài đang làm.');
        }
      } catch (e) {
        console.error(e);

        if (active) {
          setError('Lỗi tải bài làm.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [id]);

  // Đồng hồ dựa trên thời điểm hết hạn đã lưu
  useEffect(() => {
    const timer = setInterval(() => {
      const current = attemptRef.current;

      if (!current || finishing.current) return;

      const left = Math.max(
        0,
        Math.ceil((current.expiresAt - Date.now()) / 1000)
      );

      setRemaining(left);

      if (left === 0) {
        void finish();
      }
    }, 250);

    return () => clearInterval(timer);
  }, []);

  // Chọn hoặc đổi đáp án
  function choose(choice: number) {
    const current = attemptRef.current;

    if (
      !current ||
      finishing.current ||
      Date.now() >= current.expiresAt
    ) {
      return;
    }

    const questionId = current.questionIds[index];

    const updated: QuizAttempt = {
      ...current,
      answers: {
        ...current.answers,
        [questionId]: choice,
      },
    };

    attemptRef.current = updated;
    setAttempt(updated);

    // Ghi tuần tự để không mất đáp án
    writes.current = writes.current
      .then(async () => {
        const saved = await saveAnswer(
          current.id,
          questionId,
          choice
        );

        if (!saved && Date.now() < current.expiresAt) {
          throw new Error('Lưu đáp án thất bại');
        }
      })
      .catch(e => {
        console.error(e);
        setError('Không lưu được đáp án.');
      });
  }

  if (loading) {
    return (
      <ActivityIndicator style={{ marginTop: 45 }} />
    );
  }

  if (!attempt) {
    return (
      <View style={styles.page}>
        <Text>{error || 'Không tìm thấy bài làm.'}</Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.white}>Về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  const questionId = attempt.questionIds[index];
  const question = questions.find(q => q.id === questionId);

  if (!question) {
    return (
      <View style={styles.page}>
        <Text>
          Không tìm thấy câu hỏi {questionId}.
        </Text>
      </View>
    );
  }

  const total = attempt.questionIds.length;

  const answered = attempt.questionIds.filter(
    qid => attempt.answers[qid] !== undefined
  ).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
    >
      <Text style={styles.title}>
        📝 {topicName(attempt.topic)}
      </Text>

      <Text style={styles.subtitle}>
        {attempt.fullName} • {attempt.studentId}
      </Text>

      <View style={styles.status}>
        <Text>Câu {index + 1}/{total}</Text>

        <Text>Đã trả lời: {answered}/{total}</Text>

        <Text style={styles.timer}>
          ⏰ {formatTime(remaining)}
        </Text>
      </View>

      {/* Chuyển nhanh câu hỏi */}
      <View style={styles.numbers}>
        {attempt.questionIds.map((qid, i) => (
          <Pressable
            key={qid}
            onPress={() => setIndex(i)}
            style={[
              styles.number,
              attempt.answers[qid] !== undefined &&
                styles.answered,
              i === index && styles.active,
            ]}
          >
            <Text style={styles.numberText}>
              {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.hint}>
        Xanh: đã trả lời • Xám: chưa trả lời • Viền hồng: câu hiện tại
      </Text>

      {/* Câu hỏi và bốn phương án */}
      <View style={styles.card}>
        <Text style={styles.question}>
          Câu {index + 1}: {question.content}
        </Text>

        {question.options.map((option, i) => (
          <AnswerOption
            key={i}
            index={i}
            label={option}
            selected={attempt.answers[questionId] === i}
            onPress={() => choose(i)}
          />
        ))}
      </View>

      {/* Điều hướng */}
      <View style={styles.row}>
        <Pressable
          disabled={index === 0}
          onPress={() => setIndex(i => i - 1)}
          style={[
            styles.button,
            styles.half,
            index === 0 && styles.disabled,
          ]}
        >
          <Text style={styles.white}>
            ← Câu trước
          </Text>
        </Pressable>

        <Pressable
          disabled={index === total - 1}
          onPress={() => setIndex(i => i + 1)}
          style={[
            styles.button,
            styles.half,
            index === total - 1 && styles.disabled,
          ]}
        >
          <Text style={styles.white}>
            Câu tiếp →
          </Text>
        </Pressable>
      </View>

      {/* Nộp bài */}
      <Pressable
        style={[styles.button, styles.submit]}
        onPress={() => {
          if (Date.now() >= attempt.expiresAt) {
            void finish();
          } else {
            setConfirm(true);
          }
        }}
      >
        <Text style={styles.white}>NỘP BÀI</Text>
      </Pressable>

      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {/* Hộp thoại xác nhận */}
      <Modal
        visible={confirm && remaining > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.question}>
              Xác nhận nộp bài
            </Text>

            <Text>
              Đã trả lời: {answered}/{total}
            </Text>

            <Text>
              Chưa trả lời: {total - answered}
            </Text>

            <Text>
              Bạn có chắc chắn muốn nộp bài?
            </Text>

            <View style={styles.row}>
              <Pressable
                style={[
                  styles.button,
                  styles.half,
                  styles.cancel,
                ]}
                onPress={() => setConfirm(false)}
              >
                <Text style={styles.white}>HỦY</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.half]}
                onPress={() => void finish()}
              >
                <Text style={styles.white}>
                  NỘP BÀI
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff7fb',
  },
  page: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    padding: 18,
    paddingBottom: 45,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#be185d',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginVertical: 12,
  },
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  timer: {
    fontWeight: 'bold',
    color: '#be185d',
    fontSize: 17,
  },
  numbers: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  number: {
    width: 44,
    height: 44,
    backgroundColor: '#e5e7eb',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answered: {
    backgroundColor: '#bbf7d0',
  },
  active: {
    borderWidth: 3,
    borderColor: '#db2777',
  },
  numberText: {
    fontWeight: 'bold',
  },
  hint: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 17,
    marginBottom: 15,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#db2777',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  half: {
    flex: 1,
  },
  submit: {
    backgroundColor: '#9d174d',
    marginTop: 16,
  },
  white: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.35,
  },
  error: {
    color: '#b91c1c',
    marginTop: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#0008',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    gap: 12,
  },
  cancel: {
    backgroundColor: '#6b7280',
  },
});
