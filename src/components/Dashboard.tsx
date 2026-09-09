import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Sparkles,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  X,
  MapPin,
  MessageSquareText,
  BookOpen,
  Trophy,
  CheckSquare,
  ArrowRight,
  Trash2,
  Phone,
  BarChart3,
  TrendingUp,
  Star,
} from "lucide-react";
import { Student, ClassInfo, ClassEvent, ClassTask } from "../types.ts";
import { EmulationWeeklyMonthlyStats } from "./EmulationWeeklyMonthlyStats.tsx";
import { formatDateVi, formatFullDateVi, getCurrentWeekRange } from "../utils/dateUtils.ts";

interface DashboardProps {
  students: Student[];
  classInfo: ClassInfo;
  events: ClassEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ClassEvent[]>>;
  tasks?: ClassTask[];
  onNavigate: (tab: string, options?: { studentId?: number; filter?: string }) => void;
  onOpenExcelImport: () => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

// Navy palette colors from image:
const NAVY_PALETTE = {
  light: "#23395d",
  mediumLight: "#203354",
  primary: "#1c2e4a",
  dark: "#192841",
  darkest: "#152238",
};

const GROUP_COLORS = ["#23395d", "#203354", "#1c2e4a", "#192841"];

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  classInfo,
  events,
  setEvents,
  tasks = [],
  onNavigate,
  onOpenExcelImport,
  showToast,
}) => {
  const [selectedSemester, setSelectedSemester] = useState("hk1");
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "08:00 AM",
    location: classInfo.room || `Lớp ${classInfo.className}`,
    type: "meeting" as ClassEvent["type"],
  });

  // Calculate dynamic stats
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let attention = 0;
    let commentedCount = 0;

    const absentStudents: Student[] = [];

    students.forEach((s) => {
      if (s.attendance === "Có mặt") present++;
      else if (s.attendance.includes("Vắng")) {
        absent++;
        absentStudents.push(s);
      } else if (s.attendance === "Đi muộn") {
        late++;
        absentStudents.push(s);
      }

      if (s.status === "Cần quan tâm") attention++;
      if (s.aiComment && s.aiComment.trim().length > 0) commentedCount++;
    });

    const total = students.length;
    const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;
    const commentProgress = total > 0 ? Math.round((commentedCount / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      absentOrLate: absent + late,
      absentStudents,
      attention,
      presentRate,
      commentedCount,
      commentProgress,
    };
  }, [students]);

  // Top 3 Stars
  const topStars = useMemo(() => {
    return [...students].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 3);
  }, [students]);

  // Attendance chart trend data
  const chartWeeks = [
    { label: "Tuần 1", present: 35, absent: 1 },
    { label: "Tuần 2", present: 36, absent: 0 },
    { label: "Tuần 3", present: 34, absent: 2 },
    { label: "Tuần 4", present: 35, absent: 1 },
    { label: "Tuần 5", present: 36, absent: 0 },
    { label: "Tuần này", present: stats.present, absent: stats.absentOrLate },
  ];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      showToast("Vui lòng nhập tên sự kiện", "warning");
      return;
    }

    const dateObj = newEvent.date ? new Date(newEvent.date) : new Date();
    const dayOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateObj.getDay()];
    const dayNum = dateObj.getDate().toString().padStart(2, "0");

    const created: ClassEvent = {
      id: Date.now(),
      title: newEvent.title,
      date: newEvent.date || new Date().toISOString().split("T")[0],
      dayText: `${dayOfWeek} - ${dayNum}`,
      time: newEvent.time,
      location: newEvent.location,
      type: newEvent.type,
    };

    setEvents([...events, created]);
    setShowAddEventModal(false);
    setNewEvent({
      title: "",
      date: "",
      time: "08:00 AM",
      location: classInfo.room || `Lớp ${classInfo.className}`,
      type: "meeting",
    });
    showToast("Đã thêm sự kiện mới thành công!");
  };

  const handleDeleteEvent = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(events.filter((ev) => ev.id !== id));
    showToast("Đã xóa sự kiện", "info");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner - Styled in Blue Navy */}
      <div className="bg-gradient-to-r from-[#152238] via-[#1c2e4a] to-[#203354] rounded-[28px] p-6 md:p-8 shadow-lg border border-[#23395d]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden text-white">
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 shadow-xs">
              <Clock className="w-3.5 h-3.5" /> Hôm nay: {formatFullDateVi()}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#23395d]/80 text-blue-100 text-xs font-bold border border-white/10 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {getCurrentWeekRange().label} • Năm học {classInfo.year}
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
            Chào {classInfo.teacherName}! Cùng chuẩn bị bài giảng và đồng hành cùng lớp {classInfo.className} nhé! 📚
          </h2>
          <p className="text-blue-100/80 mt-2 text-sm leading-relaxed">
            Hệ sinh thái số hỗ trợ quản lý học sinh, sổ điểm danh, thi đua hoa điểm 10 và trợ lý AI viết nhận xét học bạ chuẩn Thông tư 27/2020/TT-BGDĐT.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              id="dashboard-cta-attendance-btn"
              onClick={() => onNavigate("attendance")}
              className="bg-white hover:bg-blue-50 text-[#1c2e4a] px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-[#1c2e4a]" /> Bắt đầu điểm danh
            </button>
            <button
              id="dashboard-cta-daily-report-btn"
              onClick={() => onNavigate("reports")}
              className="bg-[#23395d]/80 hover:bg-[#23395d] text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" /> Báo cáo ngày ({formatDateVi()})
            </button>
            <button
              id="dashboard-cta-ai-btn"
              onClick={() => onNavigate("ai_comment")}
              className="bg-[#23395d]/80 hover:bg-[#23395d] text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Trợ lý viết nhận xét AI ({stats.commentedCount}/{stats.total})
            </button>
          </div>
        </div>

        {/* Visual Info Card */}
        <div className="hidden lg:flex items-center justify-center w-56 h-44 bg-[#152238]/70 backdrop-blur-md rounded-2xl border border-white/15 p-4 text-center flex-col shadow-inner flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-white text-[#1c2e4a] flex items-center justify-center shadow-md mb-2">
            <Award className="w-6 h-6 text-[#1c2e4a]" />
          </div>
          <p className="text-sm font-bold text-white">Lớp {classInfo.className}</p>
          <p className="text-xs text-emerald-300 font-bold mt-1">
            Chuyên cần: {stats.presentRate}% ({stats.present}/{stats.total})
          </p>
          <p className="text-[11px] text-sky-200/80 mt-0.5 font-medium">
            Ngày {formatDateVi()}
          </p>
          <p className="text-[10px] text-blue-200/60 mt-0.5 truncate max-w-[180px]">
            {classInfo.school}
          </p>
        </div>
      </div>

      {/* 4 Interactive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Tổng học sinh */}
        <div
          id="stat-card-total"
          onClick={() => onNavigate("students")}
          className="bg-white rounded-[20px] p-5 shadow-xs border border-slate-100 hover:border-[#23395d]/30 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          title="Nhấn để xem toàn bộ danh sách học sinh"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-[#23395d]/10 p-3 rounded-2xl text-[#1c2e4a] group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-0.5 border border-emerald-100">
              <ArrowUpRight className="w-3 h-3" /> Chi tiết
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
              {stats.total}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Tổng số học sinh lớp {classInfo.className}
            </p>
          </div>
        </div>

        {/* Card 2: Đã điểm danh */}
        <div
          id="stat-card-present"
          onClick={() => onNavigate("attendance")}
          className="bg-white rounded-[20px] p-5 shadow-xs border border-slate-100 hover:border-emerald-200 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          title="Nhấn để vào sổ điểm danh"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-emerald-100/70 p-3 rounded-2xl text-emerald-600 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {stats.presentRate}%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
              {stats.present}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Có mặt hôm nay
            </p>
          </div>
        </div>

        {/* Card 3: Vắng/Muộn */}
        <div
          id="stat-card-absent"
          onClick={() => onNavigate("attendance")}
          className="bg-white rounded-[20px] p-5 shadow-xs border border-slate-100 hover:border-amber-200 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          title="Nhấn để kiểm tra các em vắng/muộn"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-amber-100/70 p-3 rounded-2xl text-amber-600 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-amber-700 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              {stats.absent} vắng • {stats.late} muộn
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
              {stats.absentOrLate}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Vắng & Đi muộn hôm nay
            </p>
          </div>
        </div>

        {/* Card 4: Cần quan tâm */}
        <div
          id="stat-card-attention"
          onClick={() => onNavigate("students", { filter: "Cần quan tâm" })}
          className="bg-gradient-to-br from-rose-50/50 to-white rounded-[20px] p-5 shadow-xs border border-rose-100 hover:border-rose-200 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          title="Nhấn để lọc các em cần quan tâm đặc biệt"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-rose-100/70 p-3 rounded-2xl text-rose-600 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-rose-700 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              Xem danh sách
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-rose-600 tracking-tight">
              {stats.attention}
            </h3>
            <p className="text-xs text-rose-600/80 font-medium mt-1">
              Học sinh cần quan tâm
            </p>
          </div>
        </div>
      </div>

      {/* Action Center: Quick Actions & Interconnected Live Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recharts Emulation Bar Chart & Action Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attention & Absent notification box */}
          {stats.absentStudents.length > 0 ? (
            <div className="bg-amber-50/70 border border-amber-200 rounded-[24px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-800">
                    Cần lưu ý hôm nay: {stats.absentStudents.length} học sinh vắng hoặc đi muộn
                  </h4>
                </div>
                <button
                  onClick={() => onNavigate("attendance")}
                  className="text-xs text-[#1c2e4a] font-bold hover:underline cursor-pointer"
                >
                  Sổ điểm danh &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {stats.absentStudents.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl p-3 border border-amber-100 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                          s.attendance === "Vắng phép"
                            ? "bg-amber-100 text-amber-800"
                            : s.attendance === "Đi muộn"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {s.attendance}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate("parents", { studentId: s.id })}
                      className="px-2.5 py-1.5 bg-[#23395d]/10 hover:bg-[#23395d]/20 text-[#1c2e4a] rounded-lg text-xs font-bold transition flex items-center gap-1 flex-shrink-0 cursor-pointer"
                      title="Nhắn tin cho phụ huynh học sinh này"
                    >
                      <MessageSquareText className="w-3.5 h-3.5" />
                      <span>Báo PH</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-[24px] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Sĩ số lớp đầy đủ hôm nay</h4>
                  <p className="text-xs text-emerald-700">100% học sinh có mặt đúng giờ. Nền nếp lớp rất tốt!</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("behavior")}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                + Thưởng sao thi đua
              </button>
            </div>
          )}

          {/* RECHARTS: BẢNG THỐNG KÊ ĐIỂM THI ĐUA & TÌNH HÌNH HỌC TẬP TRONG TUẦN/THÁNG */}
          <EmulationWeeklyMonthlyStats
            students={students}
            onNavigate={onNavigate}
            showToast={showToast}
          />

          {/* Recharts Attendance Trend Chart */}
          <div className="bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Hiệu suất chuyên cần theo tuần
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tỷ lệ học sinh có mặt và vắng/muộn các tuần gần nhất
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  id="semester-select"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#1c2e4a] cursor-pointer"
                >
                  <option value="hk1">Học kỳ I</option>
                  <option value="hk2">Học kỳ II</option>
                </select>
              </div>
            </div>

            {/* Recharts Attendance Bar Chart */}
            <div className="w-full h-52 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartWeeks}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#152238",
                      borderRadius: 12,
                      borderColor: "#23395d",
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />
                  <Bar dataKey="present" name="Có mặt (HS)" fill="#1c2e4a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="absent" name="Vắng/Muộn (HS)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Top Stars & Upcoming Events */}
        <div className="space-y-6">
          {/* Top 3 Performers Widget */}
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">Hoa Điểm 10 Dẫn Đầu</h3>
              </div>
              <button
                onClick={() => onNavigate("behavior")}
                className="text-xs text-[#1c2e4a] font-semibold hover:underline cursor-pointer"
              >
                Bảng thi đua &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {topStars.map((st, idx) => (
                <div
                  key={st.id}
                  onClick={() => onNavigate("students", { studentId: st.id })}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#23395d]/5 border border-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : idx === 1
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-50 text-amber-900"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{st.name}</p>
                      <p className="text-[10px] text-slate-500">Tổ {st.group} • Toán {st.mathScore}đ</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#1c2e4a] bg-[#23395d]/10 px-2.5 py-1 rounded-full flex-shrink-0">
                    ⭐ {st.stars || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Sự kiện & Lịch trình</h3>
                <p className="text-[11px] text-slate-400">Hoạt động lớp {classInfo.className}</p>
              </div>
              <button
                id="dashboard-open-add-event-btn"
                onClick={() => setShowAddEventModal(true)}
                className="text-[#1c2e4a] hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
                title="Thêm sự kiện mới"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {events.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-[#23395d]/5 border border-slate-100 transition group relative"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 shadow-inner ${
                      ev.type === "meeting"
                        ? "bg-[#23395d]/10 text-[#1c2e4a]"
                        : ev.type === "activity"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    <span className="text-[9px] leading-none uppercase">
                      {ev.dayText.split("-")[0].trim()}
                    </span>
                    <span className="text-sm font-extrabold leading-none mt-1">
                      {ev.dayText.split("-")[1]?.trim() || "15"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-slate-800 font-bold text-xs truncate">
                      {ev.title}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                      {ev.time} • {ev.location}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteEvent(ev.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1 absolute right-2 top-3 cursor-pointer"
                    title="Xóa sự kiện"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Chưa có sự kiện nào được lên lịch.
                </div>
              )}
            </div>

            <button
              id="dashboard-add-event-action-btn"
              onClick={() => setShowAddEventModal(true)}
              className="w-full mt-4 bg-[#23395d]/10 hover:bg-[#23395d]/20 text-[#1c2e4a] py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm sự kiện mới
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quick Launch Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate("attendance")}
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-[#23395d]/40 hover:shadow-md transition text-left flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#23395d]/10 text-[#1c2e4a] flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Điểm danh</p>
            <p className="text-xs text-slate-500">Chốt sổ chuyên cần</p>
          </div>
        </button>

        <button
          onClick={onOpenExcelImport}
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 hover:shadow-md transition text-left flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Nhập Excel</p>
            <p className="text-xs text-slate-500">Thêm cả lớp 1 chạm</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("ai_comment")}
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-[#23395d]/40 hover:shadow-md transition text-left flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#203354]/10 text-[#203354] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">AI Nhận xét</p>
            <p className="text-xs text-slate-500">Chuẩn Thông tư 27</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("behavior")}
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-amber-200 hover:shadow-md transition text-left flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Bảng thi đua</p>
            <p className="text-xs text-slate-500">Cộng sao & hoa điểm 10</p>
          </div>
        </button>
      </div>

      {/* Modal: Thêm sự kiện */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Thêm sự kiện lớp học</h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên sự kiện *
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1c2e4a] outline-none text-sm"
                  placeholder="Ví dụ: Họp ban phụ huynh học sinh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ngày diễn ra
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1c2e4a] outline-none text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Giờ
                  </label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1c2e4a] outline-none text-xs"
                    placeholder="08:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Địa điểm
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1c2e4a] outline-none text-sm"
                    placeholder="Phòng học 3A1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phân loại
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value as ClassEvent["type"] })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1c2e4a] outline-none text-sm cursor-pointer"
                >
                  <option value="meeting">Họp phụ huynh / Cuộc họp</option>
                  <option value="activity">Hoạt động trải nghiệm / Dã ngoại</option>
                  <option value="exam">Kiểm tra định kỳ</option>
                  <option value="other">Hoạt động khác</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1c2e4a] hover:bg-[#152238] text-white rounded-xl text-sm font-semibold transition shadow-md cursor-pointer"
                >
                  Lưu sự kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
