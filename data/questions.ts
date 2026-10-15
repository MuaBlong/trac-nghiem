
import type { Question, Topic } from '../types/quiz';

// Nội dung, A, B, C, D, vị trí đáp án đúng, giải thích
type Raw = [string, string, string, string, string, number, string];

const math: Raw[] = [
  ['25 + 17 = ?', '40', '42', '43', '41', 1, '25 + 17 = 42.'],
  ['60 - 28 = ?', '32', '34', '30', '38', 0, '60 - 28 = 32.'],
  ['7 × 8 = ?', '54', '48', '56', '64', 2, '7 × 8 = 56.'],
  ['81 : 9 = ?', '8', '7', '6', '9', 3, '81 : 9 = 9.'],
  ['Số nào là số nguyên tố?', '9', '15', '13', '21', 2, '13 chỉ chia hết cho 1 và 13.'],
  ['Hình vuông có bao nhiêu cạnh bằng nhau?', '2', '3', '4', '5', 2, 'Hình vuông có 4 cạnh bằng nhau.'],
  ['Một nửa của 50 là bao nhiêu?', '20', '25', '30', '15', 1, '50 : 2 = 25.'],
  ['3 × 3 = ?', '6', '8', '12', '9', 3, '3 × 3 = 9.'],
  ['Chu vi hình vuông cạnh 5 cm là?', '20 cm', '10 cm', '25 cm', '15 cm', 0, '5 × 4 = 20 cm.'],
  ['Số nào chia hết cho cả 2 và 5?', '12', '15', '20', '25', 2, '20 chia hết cho 2 và 5.'],
  ['100 - 45 = ?', '45', '55', '65', '50', 1, '100 - 45 = 55.'],
  ['6 × 9 = ?', '54', '56', '48', '64', 0, '6 × 9 = 54.'],
  ['Một giờ có bao nhiêu phút?', '30', '45', '60', '100', 2, 'Một giờ bằng 60 phút.'],
  ['Tam giác có bao nhiêu góc?', '2', '4', '5', '3', 3, 'Tam giác có 3 góc.'],
  ['Số lớn nhất trong 45, 67, 89, 76 là?', '45', '67', '89', '76', 2, '89 là số lớn nhất.'],
  ['1 mét bằng bao nhiêu xăng-ti-mét?', '10 cm', '100 cm', '1000 cm', '50 cm', 1, '1 m = 100 cm.'],
  ['48 : 6 = ?', '8', '6', '7', '9', 0, '48 : 6 = 8.'],
  ['Số liền sau của 999 là?', '998', '1001', '990', '1000', 3, '999 + 1 = 1000.'],
  ['Một phần tư của 20 là?', '4', '10', '5', '8', 2, '20 : 4 = 5.'],
  ['Diện tích hình chữ nhật dài 8 cm, rộng 5 cm là?', '40 cm²', '26 cm²', '13 cm²', '80 cm²', 0, '8 × 5 = 40 cm².'],
];

const vietnamese: Raw[] = [
  ['Từ trái nghĩa với "vui vẻ" là?', 'Hạnh phúc', 'Buồn bã', 'Phấn khởi', 'Hào hứng', 1, 'Buồn bã trái nghĩa với vui vẻ.'],
  ['Từ đồng nghĩa với "siêng năng" là?', 'Lười biếng', 'Chậm chạp', 'Chăm chỉ', 'Mệt mỏi', 2, 'Chăm chỉ gần nghĩa với siêng năng.'],
  ['Từ nào chỉ hoạt động?', 'Chạy', 'Đẹp', 'Xanh', 'Cao', 0, 'Chạy là một hoạt động.'],
  ['Cuối câu hỏi thường dùng dấu nào?', 'Dấu chấm', 'Dấu phẩy', 'Dấu chấm than', 'Dấu chấm hỏi', 3, 'Câu hỏi thường kết thúc bằng dấu ?.'],
  ['Từ nào viết đúng chính tả?', 'Sạch sẻ', 'Sạch sẽ', 'Xạch sẽ', 'Sạch xẽ', 1, 'Viết đúng là sạch sẽ.'],
  ['Từ nào chỉ đặc điểm?', 'Ăn', 'Ngủ', 'Xinh đẹp', 'Chạy', 2, 'Xinh đẹp chỉ đặc điểm.'],
  ['Trong câu "Em đang đọc sách", từ chỉ hoạt động là?', 'Em', 'Đang', 'Sách', 'Đọc', 3, 'Đọc là hoạt động.'],
  ['Từ trái nghĩa với "nhanh" là?', 'Chậm', 'Mau', 'Gấp', 'Nhanh chóng', 0, 'Chậm trái nghĩa với nhanh.'],
  ['Từ nào chỉ sự vật?', 'Đẹp', 'Cái bàn', 'Chạy', 'Vui', 1, 'Cái bàn là một đồ vật.'],
  ['Trong câu "Bầu trời rất xanh", từ chỉ đặc điểm là?', 'Bầu', 'Trời', 'Xanh', 'Rất', 2, 'Xanh là đặc điểm của bầu trời.'],
  ['Từ trái nghĩa với "cao" là?', 'Thấp', 'Dài', 'Rộng', 'Lớn', 0, 'Thấp trái nghĩa với cao.'],
  ['Từ đồng nghĩa với "dũng cảm" là?', 'Nhút nhát', 'Can đảm', 'Lo lắng', 'Yếu đuối', 1, 'Can đảm gần nghĩa với dũng cảm.'],
  ['Từ nào chỉ màu sắc?', 'Chạy', 'Ngủ', 'Xanh lá', 'Đọc', 2, 'Xanh lá chỉ màu sắc.'],
  ['Trong câu "Mẹ đang nấu cơm", ai thực hiện hoạt động?', 'Cơm', 'Đang', 'Nấu', 'Mẹ', 3, 'Mẹ là người nấu cơm.'],
  ['Từ nào viết đúng chính tả?', 'Chăm chỉ', 'Trăm chỉ', 'Chăm chĩ', 'Trăm chĩ', 0, 'Viết đúng là chăm chỉ.'],
  ['Câu nào là câu hỏi?', 'Em đang học bài.', 'Bạn tên là gì?', 'Trời đẹp quá!', 'Hãy mở sách ra.', 1, 'Bạn tên là gì? là câu hỏi.'],
  ['Từ nào chỉ hoạt động học tập?', 'Xinh', 'Đẹp', 'Viết bài', 'Cao', 2, 'Viết bài là hoạt động học tập.'],
  ['Từ trái nghĩa với "nóng" là?', 'Ấm', 'Nhiệt', 'Nắng', 'Lạnh', 3, 'Lạnh trái nghĩa với nóng.'],
  ['Trong câu "Con mèo đang ngủ", từ chỉ con vật là?', 'Con mèo', 'Đang', 'Ngủ', 'Con', 0, 'Con mèo chỉ con vật.'],
  ['Câu "Ôi, bông hoa đẹp quá!" thể hiện điều gì?', 'Buồn bã', 'Ngạc nhiên và khen ngợi', 'Lo lắng', 'Tức giận', 1, 'Câu cảm thể hiện sự ngạc nhiên, khen ngợi.'],
];

// Chuyển dữ liệu thành Question và tự gán mã T01, V01...
function make(topic: Topic, prefix: string, rows: Raw[]): Question[] {
  return rows.map(
    ([content, a, b, c, d, correctAnswer, explanation], i) => ({
      id: `${prefix}${String(i + 1).padStart(2, '0')}`,
      topic,
      content,
      options: [a, b, c, d],
      correctAnswer,
      explanation,
    })
  );
}

export const questions: Question[] = [
  ...make('TOAN', 'T', math),
  ...make('TIENGVIET', 'V', vietnamese),
];
