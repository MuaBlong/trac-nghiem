
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fce7f3' },
        headerTintColor: '#9d174d',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#fff7fb' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Trang chủ' }}
      />
      <Stack.Screen
        name="quiz"
        options={{
          title: 'Làm bài',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: 'Kết quả',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="review"
        options={{ title: 'Xem lại bài' }}
      />
      <Stack.Screen
        name="history"
        options={{ title: 'Lịch sử làm bài' }}
      />
    </Stack>
  );
}
