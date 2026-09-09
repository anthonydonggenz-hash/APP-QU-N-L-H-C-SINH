import React, { useState, useEffect, useMemo } from "react";
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  MessageSquareText,
  Star,
  Award,
} from "lucide-react";
import { Student } from "../types.ts";

interface AICommentManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  targetStudentId?: number | null;
  onNavigateToParent?: (studentId: number, text?: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const AICommentManager: React.FC<AICommentManagerProps> = ({
  students,
  setStudents,
  targetStudentId,
  onNavigateToParent,
  showToast,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (targetStudentId) return targetStudentId.toString();
    return students[0]?.id.toString() || "";
  });

  const [studentFilter, setStudentFilter] = useState<"all" | "pending" | "done">("all");
  const [subject, setSubject] = useState<string>("Toán");
  const [grade, setGrade] = useState<string>("Hoàn thành tốt");
  const [strength, setStrength] = useState<string>("Tính toán nhanh, tư duy bài toán tốt");
  const [weakness, setWeakness] = useState<string>("Cần cẩn thận hơn khi đặt tính và kiểm tra lại kết quả");
  const [style, setStyle] = useState<string>("standard_tt27");

  const [generatedText, setGeneratedText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [provider, setProvider] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync target student if passed from other tabs
  useEffect(() => {
    if (targetStudentId) {
      setSelectedStudentId(targetStudentId.toString());
    }
  }, [targetStudentId]);

  // Current student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id.toString() === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Load existing comment if student already has one
  useEffect(() => {
    if (currentStudent?.aiComment) {
      setGeneratedText(currentStudent.aiComment);
      setProvider("saved");
    } else {
      setGeneratedText("");
      setProvider("");
    }
    // Auto sync context for selected student
    handleSyncStudentContext(currentStudent);
  }, [currentStudent?.id]);

  // Filtered students for quick picker
  const filteredStudents = useMemo(() => {
    if (studentFilter === "pending") {
      return students.filter((s) => !s.aiComment || s.aiComment.trim().length === 0);
    }
    if (studentFilter === "done") {
      return students.filter((s) => s.aiComment && s.aiComment.trim().length > 0);
    }
    return students;
  }, [students, studentFilter]);

  const commentedCount = students.filter((s) => s.aiComment && s.aiComment.trim().length > 0).length;
  const progressPercent = students.length > 0 ? Math.round((commentedCount / students.length) * 100) : 0;

  // Sync Student real data into prompt context
  const handleSyncStudentContext = (st?: Student) => {
    const target = st || currentStudent;
    if (!target) return;

    if (subject === "Toán") {
      const math = target.mathScore || 8;
      if (math >= 9) {
        setGrade("Hoàn thành tốt");
        setStrength(`Toán ${math}đ: Tính toán rất nhanh và chuẩn xác, tư duy logic nhạy bén, tiếp thu bài tốt`);
        setWeakness("Khuyến khích em tiếp tục thử sức với các bài toán nâng cao");
      } else if (math >= 7) {
        setGrade("Hoàn thành");
        setStrength(`Toán ${math}đ: Nắm vững các quy tắc và phép tính cơ bản, có ý thức làm bài`);
        setWeakness("Cần rèn luyện tính cẩn thận hơn khi đặt tính và kiểm tra kết quả");
      } else {
        setGrade("Chưa hoàn thành");
        setStrength(`Toán ${math}đ: Có cố gắng và chăm chú lắng nghe bài giảng`);
        setWeakness("Cần luyện tập thêm các phép tính nhân chia và học thuộc bảng cửu chương");
      }
    } else if (subject === "Tiếng Việt") {
      const viet = target.vietnameseScore || 8;
      if (viet >= 9) {
        setGrade("Hoàn thành tốt");
        setStrength(`Tiếng Việt ${viet}đ: Đọc to, lưu loát, diễn cảm; chữ viết nắn nót, sạch đẹp; dùng từ phong phú`);
        setWeakness("Phát huy khả năng viết đoạn văn sáng tạo, giàu hình ảnh");
      } else if (viet >= 7) {
        setGrade("Hoàn thành");
        setStrength(`Tiếng Việt ${viet}đ: Đọc đúng tốc độ, hiểu nội dung bài học, trả lời được câu hỏi`);
        setWeakness("Cần rèn thêm độ đều nét chữ và đặt câu có hình ảnh sinh động");
      } else {
        setGrade("Chưa hoàn thành");
        setStrength(`Tiếng Việt ${viet}đ: Có tiến bộ khi luyện đọc từng đoạn`);
        setWeakness("Cần luyện đọc thường xuyên tại nhà và rèn kỹ năng viết chính tả không sai dấu");
      }
    } else {
      // General or other subjects
      const isGood = target.status === "Tốt";
      setGrade(isGood ? "Hoàn thành tốt" : "Hoàn thành");
      setStrength(`Ý thức kỷ luật tốt, tích cực phát biểu (+${target.stars || 0} sao thi đua), hòa đồng với bạn bè`);
      if (target.attendance !== "Có mặt") {
        setWeakness(`Cần lưu ý đi học chuyên cần và đúng giờ hơn (${target.attendance})`);
      } else {
        setWeakness("Mạnh dạn, tự tin hơn khi trao đổi và phát biểu trước lớp");
      }
    }
  };

  // Strength presets
  const strengthPresets = [
    "Tính toán nhanh và chuẩn xác",
    "Chữ viết nắn nót, trình bày sạch sẽ",
    "Hăng hái phát biểu xây dựng bài",
    "Đọc to, rõ ràng, diễn cảm",
    "Tư duy logic tốt, tiếp thu bài nhanh",
    "Ý thức kỷ luật tốt, biết giúp đỡ bạn bè",
  ];

  // Weakness presets
  const weaknessPresets = [
    "Cần cẩn thận hơn khi đặt tính",
    "Rèn thêm chữ viết và độ đều nét",
    "Cần mạnh dạn, tự tin hơn trước tập thể",
    "Cần tập trung chú ý lắng nghe bài giảng",
    "Cần giữ tốc độ làm bài vừa phải, tránh vội vàng",
  ];

  // Call Server-Side AI endpoint
  const handleGenerate = async (customStyle?: string) => {
    if (!currentStudent) {
      showToast("Vui lòng chọn một học sinh trong danh sách", "warning");
      return;
    }

    setIsGenerating(true);
    setIsCopied(false);

    try {
      const activeStyle = customStyle || style;
      const res = await fetch("/api/ai/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: currentStudent.name,
          gender: currentStudent.gender,
          subject,
          grade,
          strength,
          weakness,
          style: activeStyle,
        }),
      });

      if (!res.ok) {
        throw new Error("Lỗi khi kết nối tới máy chủ AI");
      }

      const data = await res.json();
      setGeneratedText(data.comment || "");
      setProvider(data.provider || "ai");
      showToast(
        data.provider === "gemini"
          ? "Đã tạo nhận xét bằng Gemini AI thành công!"
          : "Đã tạo nhận xét sư phạm hoàn tất!"
      );
    } catch (err) {
      console.error(err);
      // Client Fallback if offline
      const fallback = `Em ${currentStudent.name} hoàn thành tốt các nội dung môn ${subject}. ${
        strength ? `Nổi bật: ${strength.toLowerCase()}. ` : ""
      }${
        weakness ? `Cần lưu ý: ${weakness.toLowerCase()}. ` : ""
      }Thầy/cô biểu dương tinh thần học tập và khuyên khích em tiếp tục cố gắng!`;
      setGeneratedText(fallback);
      setProvider("template");
      showToast("Đã tạo nhận xét theo chuẩn sư phạm TT27!", "info");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (!generatedText) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(generatedText)
        .then(() => {
          setIsCopied(true);
          showToast("Đã sao chép nhận xét vào bộ nhớ tạm!");
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const el = document.createElement("textarea");
    el.value = generatedText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setIsCopied(true);
    showToast("Đã sao chép nhận xét vào bộ nhớ tạm!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save to Student Profile
  const handleSaveToStudent = () => {
    if (!currentStudent || !generatedText) return;

    setStudents(
      students.map((s) =>
        s.id === currentStudent.id
          ? {
              ...s,
              aiComment: generatedText,
              notes: `${s.notes ? s.notes + " | " : ""}[Nhận xét ${subject}]: ${generatedText}`,
            }
          : s
      )
    );
    showToast(`Đã lưu nhận xét vào học bạ em ${currentStudent.name}!`);
  };

  // Navigate to next or previous student
  const currentIndex = students.findIndex((s) => s.id.toString() === selectedStudentId);
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(students[currentIndex - 1].id.toString());
    }
  };
  const handleNextStudent = () => {
    if (currentIndex < students.length - 1) {
      setSelectedStudentId(students[currentIndex + 1].id.toString());
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Progress tracker */}
      <div className="bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-[#623CEB] to-[#8B5CF6] text-white p-3 rounded-2xl shadow-md shadow-purple-900/10 flex-shrink-0">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
              Trợ lý viết nhận xét học sinh (AI)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6D28D9] font-extrabold tracking-normal">
                Thông tư 27/2020/TT-BGDĐT
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Liên kết điểm số thực tế, thi đua và chuyên cần để tạo lời nhận xét chuẩn mực sư phạm, tự nhiên và khích lệ
            </p>
          </div>
        </div>

        {/* Class Progress */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 w-full md:w-64 flex-shrink-0">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-slate-700">Tiến độ nhận xét lớp</span>
            <span className="text-[#6D28D9] font-extrabold">
              {commentedCount}/{students.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#623CEB] to-[#8B5CF6] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config Panel */}
        <div className="lg:col-span-6 bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-[#6D28D9] text-xs flex items-center justify-center font-bold">
                1
              </span>
              Thiết lập dữ liệu học sinh
            </h3>

            {/* Next / Previous student controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevStudent}
                disabled={currentIndex <= 0}
                className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                title="Học sinh trước"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs font-bold text-slate-500">
                {currentIndex + 1}/{students.length}
              </span>
              <button
                onClick={handleNextStudent}
                disabled={currentIndex >= students.length - 1}
                className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                title="Học sinh sau"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Filter Pills for quick access */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Lọc HS:</span>
            <button
              onClick={() => setStudentFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                studentFilter === "all"
                  ? "bg-purple-100 text-[#6D28D9]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => setStudentFilter("pending")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                studentFilter === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chưa nhận xét ({students.length - commentedCount})
            </button>
            <button
              onClick={() => setStudentFilter("done")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                studentFilter === "done"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Đã có nhận xét ({commentedCount})
            </button>
          </div>

          {/* Student Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Học sinh đang chọn *
            </label>
            <select
              id="ai-student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none cursor-pointer font-semibold text-slate-800"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.aiComment ? "✓ " : "• "} {s.name} (Tổ {s.group} - {s.gender}) - Toán {s.mathScore}đ, TV {s.vietnameseScore}đ
                </option>
              ))}
            </select>
          </div>

          {/* Student Live Dossier Pill & Auto Sync Button */}
          {currentStudent && (
            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{currentStudent.name}</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-white rounded-full text-purple-700 border border-purple-200">
                    Tổ {currentStudent.group}
                  </span>
                  {currentStudent.aiComment && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Đã lưu
                    </span>
                  )}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Điểm Toán: <strong className="text-slate-700">{currentStudent.mathScore}đ</strong> • Tiếng Việt:{" "}
                  <strong className="text-slate-700">{currentStudent.vietnameseScore}đ</strong> • ⭐ {currentStudent.stars || 0} sao • {currentStudent.attendance}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSyncStudentContext()}
                className="px-3 py-1.5 bg-white hover:bg-purple-100 text-[#6D28D9] border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs flex-shrink-0 cursor-pointer"
                title="Tự động nạp điểm số, hoa điểm 10 và chuyên cần vào mẫu gợi ý bên dưới"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Nạp dữ liệu thực</span>
              </button>
            </div>
          )}

          {/* Subject & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Môn học / Nội dung
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setTimeout(() => handleSyncStudentContext(), 50);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none cursor-pointer font-semibold"
              >
                <option value="Toán">Toán</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội</option>
                <option value="Tin học & Công nghệ">Tin học & Công nghệ</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Đạo đức & Lối sống">Đạo đức & Lối sống</option>
                <option value="Năng lực & Phẩm chất">Năng lực & Phẩm chất</option>
                <option value="Nhận xét tổng hợp cả năm">Nhận xét tổng hợp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Mức độ đạt được (TT27)
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none cursor-pointer font-semibold"
              >
                <option value="Hoàn thành tốt">Hoàn thành tốt (T)</option>
                <option value="Hoàn thành">Hoàn thành (H)</option>
                <option value="Chưa hoàn thành">Chưa hoàn thành (C)</option>
              </select>
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Phong cách nhận xét
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStyle("standard_tt27")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition cursor-pointer ${
                  style === "standard_tt27"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                📜 Chuẩn TT 27
              </button>
              <button
                type="button"
                onClick={() => setStyle("warm")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition cursor-pointer ${
                  style === "warm"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                ❤️ Ấm áp & khích lệ
              </button>
              <button
                type="button"
                onClick={() => setStyle("concise")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition cursor-pointer ${
                  style === "concise"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                ⚡ Ngắn gọn vào học bạ
              </button>
              <button
                type="button"
                onClick={() => setStyle("parent_notice")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition cursor-pointer ${
                  style === "parent_notice"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                📱 Bản gửi Phụ huynh
              </button>
            </div>
          </div>

          {/* Strengths with suggestion pills */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Điểm mạnh / Nổi bật
              </label>
              <span className="text-[10px] text-slate-400">Chọn gợi ý nhanh</span>
            </div>
            <textarea
              rows={2}
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none resize-none leading-relaxed"
              placeholder="Ví dụ: Tính toán nhanh, tiếp thu bài tốt..."
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {strengthPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStrength(p)}
                  className="text-[11px] bg-slate-100 hover:bg-purple-100 hover:text-[#6D28D9] text-slate-600 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          {/* Improvements with suggestion pills */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Điểm cần rèn luyện thêm (sư phạm tích cực)
              </label>
            </div>
            <textarea
              rows={2}
              value={weakness}
              onChange={(e) => setWeakness(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none resize-none leading-relaxed"
              placeholder="Ví dụ: Cần cẩn thận hơn khi tính toán..."
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {weaknessPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWeakness(p)}
                  className="text-[11px] bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            id="btn-ai-generate-comment"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#623CEB] to-[#8B5CF6] hover:opacity-95 text-white font-bold py-3 rounded-xl transition shadow-md shadow-purple-900/10 flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang soạn thảo nhận xét...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Tạo nhận xét bằng Gemini AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Result Panel */}
        <div className="lg:col-span-6 bg-gradient-to-br from-purple-50/40 via-white to-white rounded-[24px] p-6 shadow-xs border border-purple-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-purple-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6D28D9] text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-bold text-slate-800 text-sm">
                  Lời nhận xét hoàn chỉnh
                </h3>
              </div>

              {generatedText && (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-ai-comment"
                    onClick={handleCopy}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-save-ai-comment-profile"
                    onClick={handleSaveToStudent}
                    className="text-xs font-semibold px-3 py-1.5 bg-[#6D28D9] text-white hover:bg-[#5B21B6] rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Lưu vào hồ sơ học bạ học sinh"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu vào học bạ</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content Output Box */}
            <div className="min-h-[220px] flex flex-col">
              {generatedText ? (
                <div className="space-y-3">
                  <textarea
                    id="ai-generated-comment-textarea"
                    rows={6}
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    className="w-full p-4 bg-white border border-purple-200/80 rounded-2xl text-slate-800 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#6D28D9] shadow-inner resize-none font-medium"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>
                      Học sinh:{" "}
                      <strong className="text-slate-800">
                        {currentStudent?.name}
                      </strong>{" "}
                      • Môn: {subject}
                    </span>
                    <span className="text-[#6D28D9] font-medium">
                      {provider === "gemini"
                        ? "✨ Tạo bởi Gemini AI"
                        : provider === "saved"
                        ? "💾 Đang lưu trong học bạ"
                        : "📝 Chuẩn hóa sư phạm"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/70 rounded-2xl border-2 border-dashed border-purple-200">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6D28D9] flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Sẵn sàng soạn thảo nhận xét
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Bấm nút <strong className="text-[#6D28D9]">Nạp dữ liệu thực</strong> và{" "}
                    <strong className="text-[#6D28D9]">Tạo nhận xét bằng Gemini AI</strong> để trợ lý viết câu văn chuẩn mực Thông tư 27.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Refine & Cross-link Action Bar */}
          {generatedText && (
            <div className="pt-4 border-t border-purple-100 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500 uppercase">
                  Tinh chỉnh phong cách
                </p>

                {onNavigateToParent && currentStudent && (
                  <button
                    onClick={() => onNavigateToParent(currentStudent.id, generatedText)}
                    className="text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    <span>Gửi nhận xét này cho Phụ huynh &rarr;</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Viết lại
                </button>
                <button
                  onClick={() => handleGenerate("concise")}
                  disabled={isGenerating}
                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 rounded-xl transition cursor-pointer"
                >
                  Ngắn gọn hơn
                </button>
                <button
                  onClick={() => handleGenerate("warm")}
                  disabled={isGenerating}
                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 rounded-xl transition cursor-pointer"
                >
                  Cảm xúc & khích lệ
                </button>
                <button
                  onClick={() => handleGenerate("parent_notice")}
                  disabled={isGenerating}
                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 rounded-xl transition cursor-pointer"
                >
                  Bản gửi phụ huynh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
