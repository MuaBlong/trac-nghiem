
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import type { QuizResult } from '../types/quiz';
import { getHistory } from '../services/storage';
import { topicName, formatTime } from '../utils/quizHelper';

export default function HistoryScreen() {
  const router = useRouter();

  const [items, setItems] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setError('');

      getHistory()
        .then(history => {
          if (active) setItems(history);
        })
        .catch(e => {
          console.error(e);

          if (active) {
            setError('Không tải được lịch sử.');
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  const average = items.length
    ? items.reduce((sum, item) => sum + item.score, 0) /
      items.length
    : 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
    >
      <Text style={styles.title}>
        📜 LỊCH SỬ LÀM BÀI
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={styles.stats}>
            <Text style={styles.stat}>
              Tổng lượt: {items.length}
            </Text>

            <Text style={styles.stat}>
              Điểm TB: {average.toFixed(2)}/10
            </Text>
          </View>

          {!!error && <Text>{error}</Text>}

          {items.length === 0 ? (
            <Text style={styles.empty}>
              Chưa có bài làm nào.
            </Text>
          ) : (
            items.map((result, i) => (
              <Pressable
                key={result.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/result',
                    params: { id: result.id },
                  })
                }
              >
                <Text style={styles.heading}>
                  #{items.length - i} • {topicName(result.topic)}
                </Text>

                <Text>
                  👩‍🎓 {result.fullName} – {result.studentId}
                </Text>

                <Text>
                  📅 {new Date(result.startedAt).toLocaleString('vi-VN')}
                </Text>

                <Text>
                  ⏱ {formatTime(result.usedSeconds)}
                  {' • '}Đúng {result.correct}/5
                </Text>

                <Text style={styles.score}>
                  Điểm: {result.score}/10 →
                </Text>
              </Pressable>
            ))
          )}
        </>
      )}

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.white}>
          🏠 VỀ TRANG CHỦ
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
    maxWidth: 700,
    alignSelf: 'center',
    padding: 18,
    paddingBottom: 40,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#be185d',
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fce7f3',
    padding: 17,
    borderRadius: 12,
    marginBottom: 16,
  },
  stat: {
    fontWeight: 'bold',
    color: '#9d174d',
  },
  card: {
    backgroundColor: '#fff',
    padding: 17,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#9d174d',
  },
  score: {
    color: '#db2777',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginVertical: 40,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#db2777',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  white: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
