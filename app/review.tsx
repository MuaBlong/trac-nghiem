
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
import { questions } from '../data/questions';
import AnswerOption from '../components/AnswerOption';

export default function ReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

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
        <Text>Không tìm thấy bài đã nộp.</Text>
      </View>
    );
  }

  const questionId = result.questionIds[index];
  const question = questions.find(q => q.id === questionId);

  if (!question) {
    return (
      <View style={styles.page}>
        <Text>Không tìm thấy câu hỏi {questionId}.</Text>
      </View>
    );
  }

  const selected = result.answers[questionId];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
    >
      <Text style={styles.title}>
        🔍 XEM LẠI BÀI LÀM
      </Text>

      <Text style={styles.subtitle}>
        Câu {index + 1}/{result.questionIds.length}
        {' • '}Chỉ xem, không thể sửa
      </Text>

      <View style={styles.numbers}>
        {result.questionIds.map((qid, i) => (
          <Pressable
            key={qid}
            onPress={() => setIndex(i)}
            style={[
              styles.number,
              i === index && styles.active,
            ]}
          >
            <Text>{i + 1}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>
          Câu {index + 1}: {question.content}
        </Text>

        {question.options.map((option, i) => (
          <AnswerOption
            key={i}
            index={i}
            label={option}
            selected={selected === i}
            correct={i === question.correctAnswer}
            wrong={
              i === selected &&
              selected !== question.correctAnswer
            }
            disabled
            onPress={() => {}}
          />
        ))}

        <Text style={styles.feedback}>
          {selected === undefined
            ? '⚪ Chưa trả lời'
            : selected === question.correctAnswer
              ? '✅ Trả lời đúng'
              : '❌ Trả lời sai'}
        </Text>

        <Text style={styles.answer}>
          Đáp án đúng:{' '}
          {String.fromCharCode(65 + question.correctAnswer)}
        </Text>

        <Text style={styles.explanation}>
          💡 Giải thích: {question.explanation}
        </Text>
      </View>

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
          disabled={index === result.questionIds.length - 1}
          onPress={() => setIndex(i => i + 1)}
          style={[
            styles.button,
            styles.half,
            index === result.questionIds.length - 1 &&
              styles.disabled,
          ]}
        >
          <Text style={styles.white}>
            Câu tiếp →
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.replace({
            pathname: '/result',
            params: { id: result.id },
          })
        }
      >
        <Text style={styles.white}>
          QUAY LẠI KẾT QUẢ
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#be185d',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 15,
  },
  numbers: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 15,
  },
  number: {
    width: 43,
    height: 43,
    backgroundColor: '#e5e7eb',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    borderWidth: 2,
    borderColor: '#db2777',
    backgroundColor: '#fce7f3',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  feedback: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  answer: {
    color: '#15803d',
    fontWeight: 'bold',
    marginTop: 12,
  },
  explanation: {
    backgroundColor: '#fef9c3',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
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
    marginTop: 12,
  },
  half: {
    flex: 1,
  },
  white: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.35,
  },
});
