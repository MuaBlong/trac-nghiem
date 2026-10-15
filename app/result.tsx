
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import type { QuizResult } from '../types/quiz';
import { getHistory } from '../services/storage';
import { formatTime, topicName } from '../utils/quizHelper';

export default function ResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getHistory()
      .then(history => {
        if (active) {
          setResult(
            history.find(item => item.id === id) ?? null
          );
        }
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 45 }} />;
  }

  if (!result) {
    return (
      <View style={styles.page}>
        <Text>Không tìm thấy kết quả.</Text>

        <Pressable
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.white}>Trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
    >
      <Text style={styles.title}>
        🏆 KẾT QUẢ BÀI LÀM
      </Text>

      <View style={styles.card}>
        <Text style={styles.score}>
          {result.score}/10
        </Text>

        <Text style={styles.center}>Điểm số</Text>

        <Text>
          👩‍🎓 Họ tên: {result.fullName}
        </Text>

        <Text>
          Mã sinh viên: {result.studentId}
        </Text>

        <Text>
          📚 Chủ đề: {topicName(result.topic)}
        </Text>

        <Text>
          📅 Bắt đầu: {new Date(result.startedAt).toLocaleString('vi-VN')}
        </Text>

        <Text>
          ⏱ Thời gian sử dụng: {formatTime(result.usedSeconds)}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={[styles.stat, styles.correct]}>
          <Text style={styles.number}>
            {result.correct}
          </Text>
          <Text>Đúng</Text>
        </View>

        <View style={[styles.stat, styles.wrong]}>
          <Text style={styles.number}>
            {result.wrong}
          </Text>
          <Text>Sai</Text>
        </View>

        <View style={[styles.stat, styles.unanswered]}>
          <Text style={styles.number}>
            {result.unanswered}
          </Text>
          <Text style={styles.small}>
            Chưa trả lời
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: '/review',
            params: { id: result.id },
          })
        }
      >
        <Text style={styles.white}>
          🔍 XEM LẠI ĐÁP ÁN
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.white}>
          🏠 VỀ TRANG CHỦ
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondary]}
        onPress={() => router.push('/history')}
      >
        <Text style={styles.white}>
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
  page: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    padding: 18,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#be185d',
    textAlign: 'center',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    gap: 12,
  },
  score: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#db2777',
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
    color: '#6b7280',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  correct: {
    backgroundColor: '#dcfce7',
  },
  wrong: {
    backgroundColor: '#fee2e2',
  },
  unanswered: {
    backgroundColor: '#fef3c7',
  },
  number: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  small: {
    fontSize: 11,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#db2777',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: '#9d174d',
  },
  white: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
