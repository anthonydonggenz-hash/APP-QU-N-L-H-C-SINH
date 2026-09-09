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
  Trophy,
  Award,
  Calendar,
  Filter,
  Download,
  Search,
  Sparkles,
  BarChart3,
  TrendingUp,
  Star,
  Users,
  BookOpen,
  ArrowRight,
  Medal,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Student } from "../types.ts";

export type PeriodType = "week_current" | "week_last" | "month_current" | "month_last" | "semester";

interface EmulationWeeklyMonthlyStatsProps {
  students: Student[];
  onNavigate: (tab: string, options?: { studentId?: number; filter?: string }) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const EmulationWeeklyMonthlyStats: React.FC<EmulationWeeklyMonthlyStatsProps> = ({
  students,
  onNavigate,
  showToast,
}) => {
  // Period filter: week_current, week_last, month_current, month_last, semester
  const [period, setPeriod] = useState<PeriodType>("week_current");
  // Chart visual mode: "top_students" | "group_compare" | "distribution"
  const [chartMode, setChartMode] = useState<"top_students" | "group_compare" | "distribution">("top_students");
  // Search & table filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"stars" | "academic" | "name">("stars");
  const [viewMode, setViewMode] = useState<"both" | "chart_only" | "table_only">("both");

  // Multiplier or baseline shifts depending on period to realistically reflect weekly/monthly emulation
  const periodConfig = useMemo(() => {
    switch (period) {
      case "week_current":
        return {
          title: "Tuần này (Tuần 24)",
          subtitle: "Từ 04/03/2026 đến 09/03/2026",
          badge: "Tuần 24",
          multiplier: 1,
          starsPerWeek: 1,
          desc: "Đang diễn ra",
        };
      case "week_last":
        return {
          title: "Tuần trước (Tuần 23)",
          subtitle: "Từ 25/02/2026 đến 02/03/2026",
          badge: "Tuần 23",
          multiplier: 0.92,
          starsPerWeek: 0.9,
          desc: "Đã hoàn thành",
        };
      case "month_current":
        return {
          title: "Tháng này (Tháng 3)",
          subtitle: "Tháng 03/2026 (Năm học 2026-2027)",
          badge: "Tháng 03",
          multiplier: 1.8,
          starsPerWeek: 3.8,
          desc: "Tháng cao điểm thi đua",
        };
      case "month_last":
        return {
          title: "Tháng trước (Tháng 2)",
          subtitle: "Tháng 02/2026 (Năm học 2026-2027)",
          badge: "Tháng 02",
          multiplier: 1.65,
          starsPerWeek: 3.5,
          desc: "Tổng kết tháng 2",
        };
      case "semester":
        return {
          title: "Cả Học kỳ I",
          subtitle: "Giai đoạn học kỳ I năm học 2026-2027",
          badge: "Học kỳ I",
          multiplier: 2.8,
          starsPerWeek: 8.0,
          desc: "Toàn diện học kỳ",
        };
    }
  }, [period]);

  // Compute calculated student scores according to selected period
  const processedStudents = useMemo(() => {
    return students.map((s) => {
      const baseStars = s.stars || 10;
      const math = s.mathScore || 8.0;
      const viet = s.vietnameseScore || (s as any).vietScore || 8.0;
      const academicAvg = parseFloat(((math + viet) / 2).toFixed(1));

      // Calculate period-specific emulation stars
      let periodStars = baseStars;
      if (period === "week_current") {
        periodStars = Math.max(2, Math.round(baseStars * 0.45));
      } else if (period === "week_last") {
        periodStars = Math.max(2, Math.round(baseStars * 0.42));
      } else if (period === "month_current") {
        periodStars = baseStars;
      } else if (period === "month_last") {
        periodStars = Math.max(5, Math.round(baseStars * 0.9));
      } else if (period === "semester") {
        periodStars = Math.round(baseStars * 2.2);
      }

      // Rank category based on stars and academic performance
      let rankCategory: "Xuất sắc" | "Tốt" | "Đạt" | "Cần cố gắng" = "Tốt";
      if (periodStars >= (period === "semester" ? 35 : period === "month_current" || period === "month_last" ? 16 : 7) && academicAvg >= 9.0) {
        rankCategory = "Xuất sắc";
      } else if (periodStars >= (period === "semester" ? 25 : period === "month_current" || period === "month_last" ? 12 : 5) && academicAvg >= 7.5) {
        rankCategory = "Tốt";
      } else if (periodStars >= (period === "semester" ? 15 : period === "month_current" || period === "month_last" ? 8 : 3)) {
        rankCategory = "Đạt";
      } else {
        rankCategory = "Cần cố gắng";
      }

      return {
        ...s,
        periodStars,
        mathScoreCalc: math,
        vietScoreCalc: viet,
        academicAvg,
        rankCategory,
      };
    });
  }, [students, period]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalStudents = processedStudents.length;
    if (totalStudents === 0) {
      return {
        totalStars: 0,
        avgStars: 0,
        avgAcademic: 0,
        excellentCount: 0,
        goodCount: 0,
        excellentRate: 0,
        topStudent: null,
      };
    }

    const totalStars = processedStudents.reduce((sum, s) => sum + s.periodStars, 0);
    const avgStars = parseFloat((totalStars / totalStudents).toFixed(1));
    const totalAcademic = processedStudents.reduce((sum, s) => sum + s.academicAvg, 0);
    const avgAcademic = parseFloat((totalAcademic / totalStudents).toFixed(1));

    const excellentCount = processedStudents.filter((s) => s.rankCategory === "Xuất sắc").length;
    const goodCount = processedStudents.filter((s) => s.rankCategory === "Tốt").length;
    const excellentRate = Math.round(((excellentCount + goodCount) / totalStudents) * 100);

    const sortedByStars = [...processedStudents].sort((a, b) => b.periodStars - a.periodStars);
    const topStudent = sortedByStars[0] || null;

    return {
      totalStars,
      avgStars,
      avgAcademic,
      excellentCount,
      goodCount,
      excellentRate,
      topStudent,
    };
  }, [processedStudents]);

  // Recharts Data 1: Top 10 Students for BarChart
  const topStudentsChartData = useMemo(() => {
    const sorted = [...processedStudents].sort((a, b) => b.periodStars - a.periodStars);
    return sorted.slice(0, 10).map((s, index) => ({
      id: s.id,
      rank: index + 1,
      name: s.name.split(" ").slice(-2).join(" "), // Short name for clean XAxis display
      fullName: s.name,
      group: `Tổ ${s.group}`,
      stars: s.periodStars,
      academic: s.academicAvg,
      math: s.mathScoreCalc,
      viet: s.vietScoreCalc,
      rankCategory: s.rankCategory,
    }));
  }, [processedStudents]);

  // Recharts Data 2: Group Comparison
  const groupCompareChartData = useMemo(() => {
    const groupMap: Record<
      number,
      {
        id: number;
        name: string;
        totalStars: number;
        studentCount: number;
        totalAcademic: number;
        topStudent: string;
        topStars: number;
      }
    > = {
      1: { id: 1, name: "Tổ 1", totalStars: 0, studentCount: 0, totalAcademic: 0, topStudent: "", topStars: -1 },
      2: { id: 2, name: "Tổ 2", totalStars: 0, studentCount: 0, totalAcademic: 0, topStudent: "", topStars: -1 },
      3: { id: 3, name: "Tổ 3", totalStars: 0, studentCount: 0, totalAcademic: 0, topStudent: "", topStars: -1 },
      4: { id: 4, name: "Tổ 4", totalStars: 0, studentCount: 0, totalAcademic: 0, topStudent: "", topStars: -1 },
    };

    processedStudents.forEach((s) => {
      const g = s.group && groupMap[s.group] ? s.group : 1;
      const target = groupMap[g];
      target.totalStars += s.periodStars;
      target.studentCount += 1;
      target.totalAcademic += s.academicAvg;
      if (s.periodStars > target.topStars) {
        target.topStars = s.periodStars;
        target.topStudent = s.name;
      }
    });

    const colors = ["#1c2e4a", "#23395d", "#203354", "#2b4c7e"];

    return Object.values(groupMap).map((g, idx) => ({
      name: g.name,
      totalStars: g.totalStars,
      avgStars: g.studentCount > 0 ? parseFloat((g.totalStars / g.studentCount).toFixed(1)) : 0,
      avgAcademic: g.studentCount > 0 ? parseFloat((g.totalAcademic / g.studentCount).toFixed(1)) : 0,
      studentCount: g.studentCount,
      topStudent: g.topStudent,
      topStars: g.topStars,
      fillColor: colors[idx % colors.length],
    }));
  }, [processedStudents]);

  // Recharts Data 3: Distribution Chart
  const distributionChartData = useMemo(() => {
    const counts = {
      "Xuất sắc": 0,
      "Tốt": 0,
      "Đạt": 0,
      "Cần cố gắng": 0,
    };

    processedStudents.forEach((s) => {
      counts[s.rankCategory] = (counts[s.rankCategory] || 0) + 1;
    });

    const total = processedStudents.length || 1;

    return [
      {
        name: "🌟 Xuất sắc",
        count: counts["Xuất sắc"],
        percentage: Math.round((counts["Xuất sắc"] / total) * 100),
        color: "#1c2e4a",
      },
      {
        name: "🥇 Tốt",
        count: counts["Tốt"],
        percentage: Math.round((counts["Tốt"] / total) * 100),
        color: "#23395d",
      },
      {
        name: "🥈 Đạt",
        count: counts["Đạt"],
        percentage: Math.round((counts["Đạt"] / total) * 100),
        color: "#3b82f6",
      },
      {
        name: "📝 Cần cố gắng",
        count: counts["Cần cố gắng"],
        percentage: Math.round((counts["Cần cố gắng"] / total) * 100),
        color: "#f59e0b",
      },
    ];
  }, [processedStudents]);

  // Filtered & Sorted Students for the Table
  const tableStudents = useMemo(() => {
    let result = [...processedStudents];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.parentPhone?.includes(term) ||
          `tổ ${s.group}`.includes(term)
      );
    }

    if (selectedGroupFilter !== "all") {
      result = result.filter((s) => s.group.toString() === selectedGroupFilter);
    }

    if (selectedRankFilter !== "all") {
      result = result.filter((s) => s.rankCategory === selectedRankFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "stars") return b.periodStars - a.periodStars;
      if (sortBy === "academic") return b.academicAvg - a.academicAvg;
      if (sortBy === "name") {
        const lastNameA = a.name.split(" ").slice(-1)[0];
        const lastNameB = b.name.split(" ").slice(-1)[0];
        return lastNameA.localeCompare(lastNameB, "vi");
      }
      return 0;
    });

    return result;
  }, [processedStudents, searchTerm, selectedGroupFilter, selectedRankFilter, sortBy]);

  // Export Table to Excel
  const handleExportExcel = () => {
    const dataToExport = tableStudents.map((s, idx) => ({
      "STT": idx + 1,
      "Họ và Tên": s.name,
      "Tổ": `Tổ ${s.group}`,
      "Hoa Điểm 10 (Sao)": s.periodStars,
      "Điểm Toán": s.mathScoreCalc,
      "Điểm Tiếng Việt": s.vietScoreCalc,
      "Điểm TB Học tập": s.academicAvg,
      "Chuyên cần": s.attendance,
      "Xếp loại thi đua": s.rankCategory,
      "Kỳ thống kê": periodConfig.title,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ThongKeThiDua");
    const fileName = `Thong_Ke_Thi_Dua_${period}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`Đã xuất bảng thống kê thi đua ${periodConfig.badge} thành công!`);
  };

  // Custom Recharts Tooltips
  const CustomTopTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#152238] text-white p-3 rounded-xl shadow-xl border border-[#23395d]/50 text-xs min-w-[210px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <span className="font-bold text-sm text-blue-200">
              #{data.rank} {data.fullName}
            </span>
            <span className="text-[10px] bg-[#23395d] px-2 py-0.5 rounded-full text-blue-100 font-bold">
              {data.group}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Điểm thi đua ({periodConfig.badge}):</span>
              <span className="font-extrabold text-amber-400">⭐ {data.stars} sao</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Điểm học tập TB:</span>
              <span className="font-bold text-sky-300">{data.academic} / 10</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Toán: <strong className="text-white">{data.math}</strong></span>
              <span>Tiếng Việt: <strong className="text-white">{data.viet}</strong></span>
            </div>
            <div className="pt-1.5 border-t border-white/10 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Xếp loại:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                  data.rankCategory === "Xuất sắc"
                    ? "bg-amber-400/20 text-amber-300"
                    : data.rankCategory === "Tốt"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "bg-blue-400/20 text-blue-300"
                }`}
              >
                {data.rankCategory}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[28px] p-6 shadow-xs border border-slate-100 space-y-6">
      {/* SECTION HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#1c2e4a] text-white shadow-xs">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Bảng Thống Kê Điểm Thi Đua & Tình Hình Học Tập
                <span className="text-xs bg-[#23395d]/10 text-[#1c2e4a] px-2.5 py-0.5 rounded-full font-bold">
                  {periodConfig.badge}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trực quan hóa hoa điểm 10, thi đua nề nếp và kết quả môn Toán & Tiếng Việt theo {periodConfig.title.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Time Period Filter Switches */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setPeriod("week_current")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              period === "week_current"
                ? "bg-[#1c2e4a] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Tuần này
          </button>
          <button
            onClick={() => setPeriod("week_last")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              period === "week_last"
                ? "bg-[#1c2e4a] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tuần trước
          </button>
          <button
            onClick={() => setPeriod("month_current")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              period === "month_current"
                ? "bg-[#1c2e4a] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tháng này
          </button>
          <button
            onClick={() => setPeriod("month_last")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              period === "month_last"
                ? "bg-[#1c2e4a] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tháng trước
          </button>
          <button
            onClick={() => setPeriod("semester")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              period === "semester"
                ? "bg-[#1c2e4a] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Học kỳ I
          </button>
        </div>
      </div>

      {/* QUICK SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c2e4a] to-[#203354] text-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-200/80 font-semibold">Tổng sao thi đua</span>
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black">{summaryMetrics.totalStars} ⭐</div>
            <p className="text-[11px] text-blue-200/70 mt-0.5">
              Bình quân: <strong className="text-white">{summaryMetrics.avgStars}</strong> sao/học sinh
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Điểm học tập TB</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-800">{summaryMetrics.avgAcademic} <span className="text-xs text-slate-400 font-medium">/ 10</span></div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Đạt chuẩn xếp loại Tốt
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Dẫn đầu thi đua</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Medal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-slate-800 truncate">
              {summaryMetrics.topStudent ? summaryMetrics.topStudent.name : "Đang cập nhật"}
            </div>
            <p className="text-[11px] text-amber-600 font-bold mt-0.5">
              ⭐ {summaryMetrics.topStudent ? summaryMetrics.topStudent.periodStars : 0} sao • Tổ {summaryMetrics.topStudent?.group}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Tỷ lệ Tốt & Xuất sắc</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-800">{summaryMetrics.excellentRate}%</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {summaryMetrics.excellentCount + summaryMetrics.goodCount} / {processedStudents.length} học sinh
            </p>
          </div>
        </div>
      </div>

      {/* CHART VIEW SWITCHER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartMode("top_students")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                chartMode === "top_students"
                  ? "bg-white text-[#1c2e4a] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Top 10 Học sinh
            </button>
            <button
              onClick={() => setChartMode("group_compare")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                chartMode === "group_compare"
                  ? "bg-white text-[#1c2e4a] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> So sánh 4 Tổ
            </button>
            <button
              onClick={() => setChartMode("distribution")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                chartMode === "distribution"
                  ? "bg-white text-[#1c2e4a] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Phân bố thi đua
            </button>
          </div>
        </div>

        {/* View Layout Toggle: Both / Chart Only / Table Only */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode("both")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === "both" ? "bg-white text-[#1c2e4a] shadow-xs font-bold" : ""
              }`}
            >
              Cả hai
            </button>
            <button
              onClick={() => setViewMode("chart_only")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === "chart_only" ? "bg-white text-[#1c2e4a] shadow-xs font-bold" : ""
              }`}
            >
              Chỉ biểu đồ
            </button>
            <button
              onClick={() => setViewMode("table_only")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === "table_only" ? "bg-white text-[#1c2e4a] shadow-xs font-bold" : ""
              }`}
            >
              Chỉ bảng
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 bg-[#1c2e4a] hover:bg-[#152238] text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Xuất bảng thống kê ra Excel"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CONTAINER */}
      {(viewMode === "both" || viewMode === "chart_only") && (
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {chartMode === "top_students" && `Biểu đồ cột: Top 10 học sinh có hoa điểm 10 cao nhất (${periodConfig.title})`}
              {chartMode === "group_compare" && `Biểu đồ so sánh điểm thi đua & điểm học tập 4 Tổ (${periodConfig.title})`}
              {chartMode === "distribution" && `Biểu đồ phân loại chất lượng thi đua học sinh (${periodConfig.title})`}
            </span>
            <span className="text-[11px] text-slate-400">Đơn vị: Điểm sao ⭐ & Thang điểm 10</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === "top_students" ? (
                <BarChart
                  data={topStudentsChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 10]}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTopTooltip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="stars"
                    name={`Sao thi đua (${periodConfig.badge})`}
                    fill="#1c2e4a"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="academic"
                    name="Điểm học tập TB (Thang 10)"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              ) : chartMode === "group_compare" ? (
                <BarChart
                  data={groupCompareChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
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
                  <Bar dataKey="totalStars" name="Tổng sao cả tổ" fill="#1c2e4a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="avgStars" name="Sao TB/Học sinh" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="avgAcademic" name="Điểm học tập TB (Thang 10)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart
                  data={distributionChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} học sinh`, "Số lượng"]}
                    contentStyle={{
                      backgroundColor: "#152238",
                      borderRadius: 12,
                      borderColor: "#23395d",
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Số học sinh đạt danh hiệu" radius={[8, 8, 0, 0]}>
                    {distributionChartData.map((entry, index) => (
                      <Cell key={`cell-dist-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* BẢNG THỐNG KÊ CHI TIẾT (STATISTICS TABLE) */}
      {(viewMode === "both" || viewMode === "table_only") && (
        <div className="space-y-3.5 pt-2">
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                Bảng xếp hạng chi tiết ({tableStudents.length} học sinh)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1c2e4a] w-36 sm:w-44"
                />
              </div>

              {/* Group Filter */}
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="all">Tất cả tổ</option>
                <option value="1">Tổ 1</option>
                <option value="2">Tổ 2</option>
                <option value="3">Tổ 3</option>
                <option value="4">Tổ 4</option>
              </select>

              {/* Rank Filter */}
              <select
                value={selectedRankFilter}
                onChange={(e) => setSelectedRankFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="all">Tất cả xếp loại</option>
                <option value="Xuất sắc">🌟 Xuất sắc</option>
                <option value="Tốt">🥇 Tốt</option>
                <option value="Đạt">🥈 Đạt</option>
                <option value="Cần cố gắng">📝 Cần cố gắng</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="stars">⭐ Sao thi đua cao nhất</option>
                <option value="academic">📊 Điểm học tập cao nhất</option>
                <option value="name">🔤 Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
                  <th className="py-3 px-3.5 text-center w-12">Hạng</th>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-3 text-center">Tổ</th>
                  <th className="py-3 px-3 text-center">Điểm Thi Đua ({periodConfig.badge})</th>
                  <th className="py-3 px-3 text-center">Môn Toán</th>
                  <th className="py-3 px-3 text-center">Tiếng Việt</th>
                  <th className="py-3 px-3 text-center">ĐTB Học Tập</th>
                  <th className="py-3 px-3 text-center">Chuyên Cần</th>
                  <th className="py-3 px-3 text-center">Xếp Loại Thi Đua</th>
                  <th className="py-3 px-3 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableStudents.map((s, index) => {
                  const isTop1 = index === 0 && sortBy === "stars";
                  const isTop2 = index === 1 && sortBy === "stars";
                  const isTop3 = index === 2 && sortBy === "stars";

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#1c2e4a]/5 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-bold">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs shadow-xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs shadow-xs">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/10 text-amber-900 text-xs shadow-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">{index + 1}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div
                          onClick={() => onNavigate("students", { studentId: s.id })}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#1c2e4a]/10 text-[#1c2e4a] font-bold flex items-center justify-center text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                            {s.name.split(" ").slice(-1)[0][0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 group-hover:text-[#1c2e4a] transition-colors">
                              {s.name}
                            </span>
                            <p className="text-[10px] text-slate-400">Mã HS: #{s.id.toString().padStart(3, "0")}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                          Tổ {s.group}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-slate-800 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full text-xs">
                          ⭐ {s.periodStars}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {s.mathScoreCalc}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {s.vietScoreCalc}
                      </td>

                      <td className="py-3 px-3 text-center font-black text-blue-700">
                        {s.academicAvg}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.attendance === "Có mặt"
                              ? "bg-emerald-50 text-emerald-700"
                              : s.attendance === "Đi muộn"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {s.attendance}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                            s.rankCategory === "Xuất sắc"
                              ? "bg-amber-500/15 text-amber-800 border border-amber-300/40"
                              : s.rankCategory === "Tốt"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : s.rankCategory === "Đạt"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {s.rankCategory}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onNavigate("behavior", { studentId: s.id })}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Thưởng sao cho học sinh"
                          >
                            +⭐
                          </button>
                          <button
                            onClick={() => onNavigate("ai_comment", { studentId: s.id })}
                            className="p-1.5 rounded-lg bg-[#1c2e4a]/10 hover:bg-[#1c2e4a]/20 text-[#1c2e4a] text-[10px] font-bold transition cursor-pointer"
                            title="Nhận xét AI"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Điểm thi đua và hoa điểm 10 được đánh giá tự động dựa trên chuyên cần, bài tập và nỗ lực học tập theo Thông tư 27.
            </span>
            <button
              onClick={() => onNavigate("behavior")}
              className="text-[#1c2e4a] font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs self-end sm:self-auto"
            >
              Mở sổ thi đua chi tiết &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
