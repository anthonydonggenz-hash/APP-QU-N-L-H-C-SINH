import React, { useState, useEffect } from "react";
import { Award, Star, Plus, Minus, Trophy, Sparkles, HeartHandshake, CheckCircle2, MessageSquareText, Users } from "lucide-react";
import { Student } from "../types.ts";

interface BehaviorManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  initialStudentId?: number | null;
  onNavigateToParent?: (studentId: number) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const BehaviorManager: React.FC<BehaviorManagerProps> = ({
  students,
  setStudents,
  initialStudentId,
  onNavigateToParent,
  showToast,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(() => {
    return initialStudentId || students[0]?.id || 1;
  });
  const [selectedReason, setSelectedReason] = useState("Phát biểu đúng, xây dựng bài tích cực");

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);
  const [recentLogs, setRecentLogs] = useState<Array<{ id: number; text: string; time: string; delta: number }>>([
    {
      id: 1,
      text: "Nguyễn Minh Anh được thưởng 2 sao vì giúp bạn ôn tập",
      time: "Vừa xong",
      delta: 2,
    },
    {
      id: 2,
      text: "Trần Bảo Khoa đạt điểm 10 môn Toán",
      time: "10 phút trước",
      delta: 5,
    },
    {
      id: 3,
      text: "Tổ 4 hoàn thành xuất sắc ca trực nhật",
      time: "Sáng nay",
      delta: 3,
    },
  ]);

  // Handle reward entire group
  const handleRewardGroup = (groupNum: number, delta: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.group === groupNum ? { ...s, stars: (s.stars || 0) + delta } : s))
    );
    const logItem = {
      id: Date.now(),
      text: `Tổ ${groupNum} được thưởng đồng loạt +${delta} sao hoa điểm 10!`,
      time: "Vừa xong",
      delta,
    };
    setRecentLogs([logItem, ...recentLogs.slice(0, 8)]);
    showToast(`Đã thưởng đồng loạt +${delta} sao cho tất cả học sinh Tổ ${groupNum}!`, "success");
  };

  // Group Rankings
  const groupStats = React.useMemo(() => {
    const groups = [1, 2, 3, 4].map((g) => {
      const groupStudents = students.filter((s) => s.group === g);
      const totalStars = groupStudents.reduce((sum, s) => sum + (s.stars || 0), 0);
      return { group: g, totalStars, count: groupStudents.length };
    });
    return groups.sort((a, b) => b.totalStars - a.totalStars);
  }, [students]);

  // Top Individual Students
  const topStudents = React.useMemo(() => {
    return [...students].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 3);
  }, [students]);

  const handleApplyPoint = (delta: number, reason: string) => {
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const newStars = Math.max(0, (student.stars || 0) + delta);
    setStudents(
      students.map((s) => (s.id === student.id ? { ...s, stars: newStars } : s))
    );

    const logItem = {
      id: Date.now(),
      text: `${student.name} ${delta > 0 ? `được tặng +${delta}` : delta} sao vì: ${reason}`,
      time: "Vừa xong",
      delta,
    };

    setRecentLogs([logItem, ...recentLogs.slice(0, 8)]);
    showToast(
      delta > 0
        ? `Đã tặng +${delta} hoa điểm 10 cho ${student.name}!`
        : `Đã trừ ${Math.abs(delta)} sao đối với ${student.name}`,
      delta > 0 ? "success" : "warning"
    );
  };

  const quickPraiseReasons = [
    { label: "Phát biểu tích cực (+1)", delta: 1, text: "Phát biểu đúng, hăng hái xây dựng bài" },
    { label: "Việc tốt giúp bạn (+2)", delta: 2, text: "Có hành động đẹp, giúp đỡ bạn bè trong lớp" },
    { label: "Hoa điểm 10 (+5)", delta: 5, text: "Đạt điểm 10 xuất sắc trong bài kiểm tra" },
    { label: "Trực nhật sạch (+2)", delta: 2, text: "Ý thức giữ vệ sinh lớp học và trực nhật sạch sẽ" },
    { label: "Mất trật tự (-1)", delta: -1, text: "Còn nói chuyện riêng, mất trật tự trong giờ học" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-[#6D28D9]" /> Thi Đua Lớp Học & Hoa Điểm 10
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Khích lệ tinh thần tự giác, khen thưởng tiến bộ và thi đua giữa các tổ
          </p>
        </div>
      </div>

      {/* Group Ranking Podium */}
      <div className="bg-gradient-to-r from-[#623CEB] via-[#6D28D9] to-[#8B5CF6] rounded-[24px] p-6 text-white shadow-md shadow-purple-900/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Bảng Xếp Hạng 4 Tổ Tuần Này</h3>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
            Tổng kết tuần
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {groupStats.map((item, index) => {
            const isFirst = index === 0;
            return (
              <div
                key={item.group}
                className={`p-4 rounded-2xl backdrop-blur-xs transition-transform ${
                  isFirst
                    ? "bg-white text-slate-800 shadow-lg scale-105"
                    : "bg-white/10 text-white border border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full uppercase ${
                      isFirst
                        ? "bg-amber-100 text-amber-800"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    Hạng {index + 1}
                  </span>
                  {isFirst && <Sparkles className="w-4 h-4 text-amber-500" />}
                </div>
                <h4 className="text-lg font-extrabold">Tổ {item.group}</h4>
                <p
                  className={`text-2xl font-black mt-1 ${
                    isFirst ? "text-[#6D28D9]" : "text-amber-300"
                  }`}
                >
                  {item.totalStars}{" "}
                  <span className="text-xs font-normal opacity-80">sao</span>
                </p>
                <p
                  className={`text-[11px] mt-1 ${
                    isFirst ? "text-slate-500" : "text-purple-200"
                  }`}
                >
                  {item.count} thành viên
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Group Rewards under podium */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-purple-100 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-300" /> Thưởng sao cả tổ tích cực:
          </span>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                onClick={() => handleRewardGroup(g, 2)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> +2 sao Tổ {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Awarding Points & Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Award Form */}
        <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            Cộng / Trừ sao thi đua học sinh
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Chọn học sinh
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#6D28D9] outline-none cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Tổ {s.group} • Hiện có {s.stars || 0} sao)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Lý do khen thưởng / nhắc nhở
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6D28D9] outline-none"
                placeholder="Nhập lý do..."
              />
              <button
                type="button"
                onClick={() => handleApplyPoint(1, selectedReason || "Tiến bộ trong học tập")}
                className="px-3.5 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> +1 sao
              </button>
            </div>
          </div>

          {onNavigateToParent && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateToParent(selectedStudentId)}
                className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-[#6D28D9] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-purple-200"
              >
                <MessageSquareText className="w-3.5 h-3.5" /> Báo tin hoa điểm 10 tới Phụ huynh em này
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Khen thưởng nhanh theo tiêu chí
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPraiseReasons.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPoint(qr.delta, qr.text)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                    qr.delta > 0
                      ? "bg-purple-50 text-[#6D28D9] hover:bg-purple-100"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  <span>{qr.label}</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Top Star Achievers & Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top 3 Stars */}
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Gương Mặt Tiêu Biểu Nhất Lớp
            </h3>
            <div className="space-y-2.5">
              {topStudents.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? "bg-amber-400 text-white"
                          : idx === 1
                          ? "bg-slate-300 text-slate-800"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{s.name}</p>
                      <p className="text-[10px] text-slate-400">Tổ {s.group}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#6D28D9] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    {s.stars || 0} sao
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Action Log */}
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3">
              Nhật ký khen thưởng gần đây
            </h3>
            <div className="space-y-2 text-xs">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <p className="text-slate-700 leading-snug truncate pr-2">
                    {log.text}
                  </p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
