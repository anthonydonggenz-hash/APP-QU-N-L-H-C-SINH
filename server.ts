import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// AI Comment generation endpoint
app.post("/api/ai/comment", async (req, res) => {
  const {
    studentName,
    gender = "Nam",
    subject = "Toán",
    grade = "Hoàn thành tốt",
    strength = "",
    weakness = "",
    style = "standard_tt27", // standard_tt27 | warm | concise | parent_notice
  } = req.body;

  if (!studentName) {
    res.status(400).json({ error: "Thiếu tên học sinh" });
    return;
  }

  const ai = getGenAI();

  if (ai) {
    try {
      let styleInstruction = "";
      if (style === "concise") {
        styleInstruction = "Viết thật ngắn gọn, súc tích (1-2 câu), thích hợp vào sổ điểm danh tử hoặc phần mềm học bạ điện tử (SMAS/VnEdu).";
      } else if (style === "warm") {
        styleInstruction = "Giọng văn ấm áp, thân tình, giàu tình yêu thương của thầy/cô giáo, truyền cảm hứng cho học trò.";
      } else if (style === "parent_notice") {
        styleInstruction = "Viết dưới dạng tin nhắn/thông báo gửi tới phụ huynh về tình hình học tập và rèn luyện của con trong tuần/học kỳ, đề xuất phối hợp giữa gia đình và nhà trường.";
      } else {
        styleInstruction = "Tuân thủ chặt chẽ tinh thần Thông tư 27/2020/TT-BGDĐT: Đánh giá vì sự tiến bộ của học sinh, tôn trọng cá nhân, khen ngợi cụ thể và gợi mở biện pháp hỗ trợ.";
      }

      const prompt = `Bạn là giáo viên tiểu học mẫu mực và chuyên viên sư phạm. Hãy viết lời nhận xét cho học sinh tiểu học:
- Họ và tên học sinh: ${studentName} (${gender})
- Môn học / Lĩnh vực: ${subject}
- Mức độ đạt được: ${grade}
- Điểm mạnh / Nổi bật: ${strength || "Chăm chỉ, hoàn thành bài đúng hạn, tích cực trong giờ học"}
- Điểm cần rèn luyện thêm: ${weakness || "Cần giữ vững phong độ và rèn tính cẩn thận"}
- Yêu cầu văn phong: ${styleInstruction}

Lưu ý: Chỉ trả về nội dung nhận xét hoàn chỉnh, không thêm tiêu đề, không để dấu ngoặc kép thừa, câu từ trau chuốt, tự nhiên bằng tiếng Việt chuẩn.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là trợ lý giáo viên tiểu học Việt Nam chuyên viết nhận xét học sinh theo Thông tư 27/2020/TT-BGDĐT. Luôn viết nhận xét khích lệ, chuẩn mực sư phạm.",
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text) {
        res.json({ comment: text, provider: "gemini" });
        return;
      }
    } catch (err) {
      console.error("Gemini API generation error:", err);
      // Fallback gracefully below
    }
  }

  // Pedagogical Smart Template Fallback
  const pronoun = gender === "Nữ" ? "em" : "em";
  let fallbackText = "";

  if (style === "parent_notice") {
    fallbackText = `Kính gửi phụ huynh ${studentName}, trong thời gian qua em ${studentName} học tập môn ${subject} đạt mức "${grade}". ${
      strength ? `Ở lớp, em ${strength.toLowerCase()}. ` : "Em có tinh thần học tập nghiêm túc, chú ý nghe giảng. "
    }${
      weakness
        ? `Để giúp em tiến bộ hơn nữa, thầy/cô mong gia đình nhắc nhở em ${weakness.toLowerCase()}. `
        : "Thầy/cô rất mong em tiếp tục giữ vững thành tích này. "
    }Trân trọng cảm ơn sự đồng hành của gia đình!`;
  } else if (style === "concise") {
    fallbackText = `Em ${studentName} ${
      grade === "Hoàn thành tốt" ? "nắm chắc kiến thức" : "hoàn thành nội dung"
    } môn ${subject}. ${strength ? `Nổi bật: ${strength.toLowerCase()}. ` : ""}${
      weakness ? `Cần: ${weakness.toLowerCase()}.` : "Cần phát huy."
    }`;
  } else if (style === "warm") {
    fallbackText = `Thầy/cô rất vui mừng trước sự nỗ lực của ${studentName} ở môn ${subject}. ${
      strength
        ? `Thầy/cô đặc biệt khen ngợi em vì đã ${strength.toLowerCase()}. `
        : "Em luôn chăm chỉ và thể hiện tinh thần ham học hỏi mỗi ngày. "
    }${
      weakness
        ? `Thầy/cô tin rằng nếu chú ý rèn luyện thêm việc ${weakness.toLowerCase()}, em chắc chắn sẽ còn toả sáng hơn nữa! Cố lên nhé ${studentName}!`
        : `Thầy/cô chúc ${studentName} luôn giữ vững niềm say mê học tập và gặt hái thêm nhiều hoa điểm 10!`
    }`;
  } else {
    // Standard TT27
    fallbackText = `Em ${studentName} ${
      grade === "Hoàn thành tốt"
        ? `hoàn thành xuất sắc các yêu cầu cần đạt của môn ${subject}`
        : grade === "Hoàn thành"
        ? `đã hoàn thành tốt nội dung học tập môn ${subject}`
        : `cần tích cực hơn trong các giờ học môn ${subject}`
    }. ${
      strength
        ? `Em ${strength.toLowerCase()}. `
        : "Em có ý thức tự giác học tập và tiếp thu bài tương đối nhanh. "
    }${
      weakness
        ? `Tuy nhiên, để đạt kết quả toàn diện hơn, ${pronoun} cần chú ý ${weakness.toLowerCase()}. `
        : "Thầy/cô biểu dương tinh thần học tập và mong em tiếp tục phát huy."
    }`;
  }

  res.json({ comment: fallbackText, provider: "template" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
