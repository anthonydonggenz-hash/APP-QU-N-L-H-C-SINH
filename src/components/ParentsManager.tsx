import React, { useState, useEffect } from "react";
import { MessageSquareText, Phone, Copy, Check, Send, Search, Users, Sparkles, ExternalLink } from "lucide-react";
import { Student, ClassInfo } from "../types.ts";

interface ParentsManagerProps {
  students: Student[];
  classInfo: ClassInfo;
  initialStudentId?: number | null;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const ParentsManager: React.FC<ParentsManagerProps> = ({
  students,
  classInfo,
  initialStudentId,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number>(() => {
    return initialStudentId || students[0]?.id || 1;
  });
  const [templateType, setTemplateType] = useState<"attendance" | "praise" | "aiComment" | "concern" | "meeting" | "reminder">("praise");
  const [customText, setCustomText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Clean phone number for Zalo
  const cleanPhone = currentStudent?.parentPhone ? currentStudent.parentPhone.replace(/\D/g, "") : "";

  // Auto-compose templates
  const composedMessage = React.useMemo(() => {
    if (!currentStudent) return "";

    if (templateType === "aiComment") {
      const comment = currentStudent.aiComment || "Con có tinh thần học tập tích cực, lễ phép và chăm chỉ hoàn thành tốt các nhiệm vụ được giao.";
      return `Kính gửi phụ huynh em ${currentStudent.name},\n${classInfo.teacherName} (GVCN Lớp ${classInfo.className}) xin gửi tới gia đình đánh giá học tập & rèn luyện của con theo Thông tư 27:\n"${comment}"\nKính mong quý phụ huynh tiếp tục đồng hành và khích lệ con. Trân trọng cảm ơn!`;
    } else if (templateType === "attendance") {
      return `Kính gửi phụ huynh em ${currentStudent.name},\n${classInfo.teacherName} (GVCN Lớp ${classInfo.className}) xin thông báo: Hôm nay ngày ${new Date().toLocaleDateString("vi-VN")}, tình trạng chuyên cần của con là: ${currentStudent.attendance}. Nếu gia đình có việc bận hoặc con ốm, kính nhờ phụ huynh nhắn lại để thầy/cô nắm được thông tin. Trân trọng cảm ơn!`;
    } else if (templateType === "praise") {
      return `Kính gửi phụ huynh em ${currentStudent.name},\n${classInfo.teacherName} (GVCN Lớp ${classInfo.className}) rất vui mừng được chia sẻ: Trong tuần qua, em ${currentStudent.name} học tập rất chăm chỉ, hăng hái phát biểu và đã tích lũy được ${currentStudent.stars || 10} sao hoa điểm 10. Thầy/cô biểu dương tinh thần của con và chúc con tiếp tục giữ vững phong độ!`;
    } else if (templateType === "concern") {
      return `Kính gửi phụ huynh em ${currentStudent.name},\n${classInfo.teacherName} (GVCN Lớp ${classInfo.className}) xin phép trao đổi nhỏ: Dạo gần đây em ${currentStudent.name} ${currentStudent.notes ? `(${currentStudent.notes})` : "còn hơi mất tập trung trong giờ học"}. Thầy/cô mong gia đình cùng phối hợp nhắc nhở nhẹ nhàng để con nhanh chóng tiến bộ hơn. Cảm ơn sự đồng hành của quý phụ huynh!`;
    } else if (templateType === "meeting") {
      return `Kính gửi phụ huynh em ${currentStudent.name},\n${classInfo.school} và GVCN Lớp ${classInfo.className} (${classInfo.teacherName}) trân trọng kính mời phụ huynh tới tham dự buổi Họp phụ huynh vào lúc 08:00 sáng Thứ Bảy tuần này tại phòng học lớp ${classInfo.className}. Sự có mặt đầy đủ của quý phụ huynh là nguồn động viên lớn cho con em. Trân trọng!`;
    } else {
      return `Kính gửi phụ huynh em ${currentStudent.name},\n${classInfo.teacherName} (GVCN Lớp ${classInfo.className}) xin nhắc gia đình kiểm tra giúp con hoàn thành bài tập về nhà và chuẩn bị đầy đủ sách vở, đồ dùng học tập cho ngày mai. Cảm ơn sự đồng hành của quý phụ huynh!`;
    }
  }, [currentStudent, templateType, classInfo]);

  const handleCopyMessage = () => {
    const textToCopy = customText || composedMessage;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        showToast("Đã sao chép tin nhắn trao đổi phụ huynh!");
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm) ||
      (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <MessageSquareText className="w-7 h-7 text-[#6D28D9]" /> Liên Lạc Phụ Huynh & Tin Nhắn
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Danh bạ liên hệ phụ huynh và soạn tin nhắn nhanh Zalo/SMS theo các mẫu chuẩn mực giáo dục
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Parent Contact Directory */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
              <span>Danh bạ phụ huynh ({students.length})</span>
            </h3>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên con, phụ huynh hoặc SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 hide-scrollbar">
              {filteredStudents.map((s) => {
                const isSelected = s.id === selectedStudentId;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setCustomText("");
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-purple-50/70 border-[#6D28D9] shadow-xs"
                        : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        PH: {s.parentName || "Chưa có tên"} • Tổ {s.group}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {s.parentPhone && (
                        <a
                          href={`tel:${s.parentPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                          title="Gọi điện"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Message Composer & Quick Templates */}
        <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Soạn tin nhắn gửi PH: {currentStudent?.name}
              </h3>
              <p className="text-xs text-slate-500">
                SĐT:{" "}
                <strong className="text-[#6D28D9]">
                  {currentStudent?.parentPhone || "Chưa có số"}
                </strong>
              </p>
            </div>
            <span className="text-xs bg-purple-100 text-[#6D28D9] px-2.5 py-1 rounded-full font-bold">
              Lớp {classInfo.className}
            </span>
          </div>

          {/* Template Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Chọn mẫu tin nhắn thông báo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTemplateType("aiComment");
                  setCustomText("");
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition border cursor-pointer ${
                  templateType === "aiComment"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9] font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                ✨ Nhận xét học bạ AI
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateType("praise");
                  setCustomText("");
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition border cursor-pointer ${
                  templateType === "praise"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9] font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🌟 Khen ngợi con tiến bộ
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateType("attendance");
                  setCustomText("");
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition border cursor-pointer ${
                  templateType === "attendance"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9] font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                📅 Báo chuyên cần
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateType("concern");
                  setCustomText("");
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition border cursor-pointer ${
                  templateType === "concern"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9] font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                ⚠️ Phối hợp nhắc nhở
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateType("meeting");
                  setCustomText("");
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition border cursor-pointer ${
                  templateType === "meeting"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9] font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🏫 Giấy mời họp PH
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateType("reminder");
                  setCustomText("");
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition border cursor-pointer ${
                  templateType === "reminder"
                    ? "bg-purple-50 border-[#6D28D9] text-[#6D28D9] font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                📚 Nhắc bài tập & đồ dùng
              </button>
            </div>
          </div>

          {/* Textarea Preview & Edit */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Nội dung tin nhắn
              </label>
              <span className="text-[10px] text-slate-400">Có thể chỉnh sửa trực tiếp</span>
            </div>
            <textarea
              rows={7}
              value={customText || composedMessage}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-[#6D28D9] resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyMessage}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép tin</span>
                  </>
                )}
              </button>

              {cleanPhone && (
                <a
                  href={`https://zalo.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở Zalo PH
                </a>
              )}

              {currentStudent?.parentPhone && (
                <a
                  href={`sms:${currentStudent.parentPhone}?body=${encodeURIComponent(
                    customText || composedMessage
                  )}`}
                  className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Mở SMS
                </a>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium">{classInfo.teacherName} • GVCN Lớp {classInfo.className}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
