
import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import type { Topic, QuizAttempt } from '../types/quiz';
import { createQuiz, topicName } from '../utils/quizHelper';
import {
  getStudent,
  saveStudent,
  getCurrent,
  startQuiz,
  submitQuiz,
} from '../services/storage';

export default function HomeScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [topic, setTopic] = useState<Topic>('TOAN');
  const [current, setCurrent] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const lock = useRef(false);

  // Khôi phục dữ liệu mỗi khi mở trang chủ
  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setError('');

      async function load() {
        try {
          const [student, attempt] = await Promise.all([
            getStudent(),
            getCurrent(),
          ]);

          if (!active) return;

          if (student) {
            setName(student.fullName);
            setStudentId(student.studentId);
          }

          // Hết giờ trong lúc đóng ứng dụng
          if (attempt && Date.now() >= attempt.expiresAt) {
            const result = await submitQuiz(attempt.id);

            if (active && result) {
              setCurrent(null);
              router.replace({
                pathname: '/result',
                params: { id: result.id },
              });
            }

            return;
          }

          setCurrent(attempt);

          if (attempt) {
            setTopic(attempt.topic);
          }
        } catch (e) {
          console.error(e);

          if (active) {
            setError('Không đọc được dữ liệu đã lưu.');
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void load();

      return () => {
        active = false;
      };
    }, [router])
  );

  // Bắt đầu hoặc tiếp tục làm bài
  async function begin() {
    if (lock.current || loading) return;

    lock.current = true;
    setBusy(true);
    setError('');

    try {
      let attempt = await getCurrent();

      if (attempt && Date.now() >= attempt.expiresAt) {
        const result = await submitQuiz(attempt.id);

        if (result) {
          router.replace({
            pathname: '/result',
            params: { id: result.id },
          });
        }

        return;
      }

      if (!attempt) {
        if (!name.trim() || !studentId.trim()) {
          setError('Vui lòng nhập họ tên và mã sinh viên.');
          return;
        }

        const student = {
          fullName: name.trim(),
          studentId: studentId.trim(),
        };

        await saveStudent(student);

        attempt = await startQuiz(createQuiz(topic, student));
      }

      router.push({
        pathname: '/quiz',
        params: { id: attempt.id },
      });
    } catch (e) {
      console.error(e);
      setError('Không thể bắt đầu bài làm.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const answered = current
    ? current.questionIds.filter(
        id => current.answers[id] !== undefined
      ).length
    : 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        🌸 LUYỆN TẬP TRẮC NGHIỆM
      </Text>

      <Text style={styles.subtitle}>
        Điền thông tin, chọn môn học và bắt đầu
      </Text>

      <View style={styles.card}>
        <Text style={styles.heading}>
          👩‍🎓 Thông tin sinh viên
        </Text>

        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ và tên"
          value={name}
          onChangeText={setName}
          editable={!current && !busy}
        />

        <Text style={styles.label}>Mã sinh viên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã sinh viên"
          value={studentId}
          onChangeText={setStudentId}
          editable={!current && !busy}
        />
      </View>

      <Text style={styles.heading}>📚 Chọn chủ đề</Text>

      {(['TOAN', 'TIENGVIET'] as Topic[]).map(t => (
        <Pressable
          key={t}
          disabled={!!current || busy || loading}// true
          onPress={() => setTopic(t)}
          style={[
            styles.card,
            styles.topicCard,
            topic === t && styles.selected,
          ]}
        >
          <Text style={styles.topicText}>
            {t === 'TOAN' ? '🔢' : '📖'} {topicName(t)}
          </Text>

          <Text>{topic === t ? '🔘' : '⚪'}</Text>
        </Pressable>
      ))}

      <View style={styles.card}>
        <Text style={styles.heading}>📋 Quy định bài thi</Text>
        <Text>📝 5 câu hỏi ngẫu nhiên</Text>
        <Text>⏰ Thời gian: 3 phút</Text>
        <Text>⭐ Mỗi câu đúng: 2 điểm</Text>
        <Text>🏆 Điểm tối đa: 10 điểm</Text>
      </View>

      {current && (
        <View style={styles.notice}>
          <Text style={styles.heading}>
            📌 Có bài đang làm
          </Text>

          <Text>Chủ đề: {topicName(current.topic)}</Text>

          <Text>
            Đã trả lời: {answered}/{current.questionIds.length}
          </Text>

          <Text>
            Thời gian vẫn tiếp tục chạy khi rời ứng dụng.
          </Text>
        </View>
      )}

      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <Pressable
        style={styles.button}
        disabled={busy || loading}
        onPress={() => void begin()}
      >
        {busy || loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {current
              ? '▶ TIẾP TỤC BÀI ĐANG LÀM'
              : '🚀 BẮT ĐẦU LÀM BÀI'}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondary]}
        onPress={() => router.push('/history')}
      >
        <Text style={styles.buttonText}>
          📜 LỊCH SỬ LÀM BÀI
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff7fb',
  },
  content: {
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
    marginTop: 15,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fbcfe8',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#be185d',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  topicCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#fce7f3',
    borderColor: '#db2777',
    borderWidth: 2,
  },
  topicText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notice: {
    backgroundColor: '#fce7f3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    gap: 5,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#db2777',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondary: {
    backgroundColor: '#9d174d',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
