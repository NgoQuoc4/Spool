import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NewsItem } from "./bots.service";

export interface GeneratedTweetResult {
  content: string;
  hashtags: string[];
}

class AIService {
  private getModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Chưa cấu hình GEMINI_API_KEY trong file .env. Vui lòng thêm GEMINI_API_KEY=your_key vào server/.env",
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            content: {
              type: SchemaType.STRING,
              description: "Nội dung bài viết tweet hoàn chỉnh kèm link",
            },
            hashtags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Danh sách 2-4 hashtag không chứa dấu #",
            },
          },
          required: ["content", "hashtags"],
        },
      },
    });
  }

  /**
   * Tóm tắt và viết lại tin tức thành bài post Twitter/X chuyên nghiệp
   */
  async generateTweetFromNews(news: NewsItem): Promise<GeneratedTweetResult> {
    const model = this.getModel();

    const prompt = `
Bạn là một biên tập viên truyền thông xã hội (social media manager) chuyên nghiệp cho Twitter/X.
Hãy đọc thông tin bài báo sau và viết lại thành một bài Tweet thật bắt mắt, thoáng mắt và dễ đọc:

Tiêu đề: ${news.title}
Tóm tắt bài báo: ${news.summary}
Link gốc: ${news.link}

CẤU TRÚC BẮT BUỘC CỦA NỘI DUNG (Dùng dấu xuống dòng rõ ràng giữa các phần):
1. Dòng 1: Một câu Hook ấn tượng kèm emoji phù hợp (ví dụ: ⚡, 🚀, 🤖, 📱, 🚨).
2. Dòng 2 & 3: Tóm tắt 1-2 điểm mấu chốt quan trọng nhất của bài viết. Dùng gạch đầu dòng (• hoặc 🔹) hoặc ngắt đoạn để người đọc lướt nhanh vẫn nắm được thông tin.
3. Dòng 4: Một câu kết ngắn hoặc câu hỏi gợi mở tương tác (ví dụ: "Bạn nghĩ sao về điều này? 👇").
4. Dòng cuối: Link bài viết gốc định dạng: "🔗 Chi tiết: ${news.link}"

LƯU Ý:
- Tuyệt đối KHÔNG viết dính liền thành một khối chữ dày đặc. Phải có khoảng cách cách dòng (line breaks) giữa các phần để dễ đọc.
- Giữ độ dài vừa phải, súc tích chuẩn phong cách Twitter/X.
- Đề xuất 2 đến 4 hashtags liên quan nhất (không thêm dấu #, chỉ lấy chữ, ví dụ: "CongNghe", "AI", "TinMoi").
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) {
      throw new Error("Không nhận được phản hồi từ Gemini AI");
    }

    return JSON.parse(text) as GeneratedTweetResult;
  }
}

const aiService = new AIService();
export default aiService;
