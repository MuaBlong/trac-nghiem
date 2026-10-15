
import { Pressable, Text, StyleSheet } from 'react-native';

type Props = {
  index: number;
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  correct?: boolean;
  wrong?: boolean;
};

export default function AnswerOption({
  index,
  label,
  selected,
  onPress,
  disabled = false,
  correct = false,
  wrong = false,
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.option,
        selected && styles.selected,
        correct && styles.correct,
        wrong && styles.wrong,
      ]}
    >
      <Text style={styles.text}>
        {String.fromCharCode(65 + index)}. {label}{' '}
        {correct ? '✓' : wrong ? '✕' : selected ? '●' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
  },
  selected: {
    backgroundColor: '#fce7f3',
    borderColor: '#db2777',
    borderWidth: 2,
  },
  correct: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  wrong: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  text: {
    fontSize: 16,
    color: '#374151',
  },
});
