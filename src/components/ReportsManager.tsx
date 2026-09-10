import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Download,
  Printer,
  Users,
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  Calendar,
  Sparkles,
  History,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Student, ClassInfo, DailyHistoryMap, DailyRecordEntry } from "../types.ts";
import {
  formatDateVi,
  formatDayOfWeekVi,
  formatFullDateVi,
  formatFormalDateVi,
  getCurrentWeekRange,
  getMonthInfo,
  stepDateISO,
} from "../utils/dateUtils.ts";
import {
  loadDailyHistory,
  saveDailyHistory,
  getDailyRecordForDate,
  getAvailableRecordedDates,
} from "../data/pastRecordsData.ts";
import { UpdatePastRecordsModal } from "./UpdatePastRecordsModal.tsx";
import { VietnameseDatePicker } from "./VietnameseDatePicker.tsx";

interface ReportsManagerProps {
  students: Student[];
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
  classInfo: ClassInfo;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  students,
  setStudents,
  classInfo,
  showToast,
}) => {
  // Report period: "past_day" | "day" | "week" | "month" | "semester"
  const [reportPeriod, setReportPeriod] = useState<"past_day" | "day" | "week" | "month" | "semester">("day");

  // Selected past date in ISO format (defaults to yesterday: 2026-09-10)
  const [selectedPastDate, setSelectedPastDate] = useState<string>("2026-09-10");
  const [showPastDaysModal, setShowPastDaysModal] = useState<boolean>(false);

  // Daily historical records persistent state
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryMap>(() => {
    return loadDailyHistory(students);
  });

  const now = useMemo(() => new Date(), []);
  const todayFormatted = useMemo(() => formatDateVi(now), [now]);
  const todayFull = useMemo(() => formatFullDateVi(now), [now]);
  const formalDate = useMemo(() => formatFormalDateVi(now), [now]);
  const currentWeek = useMemo(() => getCurrentWeekRange(now), [now]);
  const currentMonth = useMemo(() => getMonthInfo(now, 0), [now]);

  // Available recorded dates list
  const availablePastDates = useMemo(() => {
    const list = getAvailableRecordedDates(dailyHistory);
    if (!list.some((item) => item.dateISO === selectedPastDate)) {
      const parts = selectedPastDate.split("-");
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dateFormatted = formatDateVi(d);
      const dayOfWeek = formatDayOfWeekVi(d);
      list.unshift({
        dateISO: selectedPastDate,
        label: `${dateFormatted} (${dayOfWeek}) - Ngày đang xem`,
        dateFormatted,
        dayOfWeek,
        isRecorded: !!dailyHistory[selectedPastDate],
      });
    }
    return list;
  }, [dailyHistory, selectedPastDate]);

  // Formatted strings for selected past date
  const selectedPastDateObj = useMemo(() => {
    const parts = selectedPastDate.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }, [selectedPastDate]);

  const selectedPastDateFormatted = useMemo(() => formatDateVi(selectedPastDateObj), [selectedPastDateObj]);
  const selectedPastDateFull = useMemo(() => formatFullDateVi(selectedPastDateObj), [selectedPastDateObj]);
  const selectedPastDateFormal = useMemo(() => formatFormalDateVi(selectedPastDateObj), [selectedPastDateObj]);

  // Records for the currently selected past date
  const activePastRecords = useMemo(() => {
    return getDailyRecordForDate(selectedPastDate, dailyHistory, students);
  }, [selectedPastDate, dailyHistory, students]);

  // Save handler for date records from modal
  const handleSaveDateRecord = (dateISO: string, records: Record<number, DailyRecordEntry>) => {
    const updatedHistory: DailyHistoryMap = {
      ...dailyHistory,
      [dateISO]: records,
    };
    setDailyHistory(updatedHistory);
    saveDailyHistory(updatedHistory);

    // If updating today's date and setStudents exists, optionally sync attendance
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (dateISO === todayISO && setStudents) {
      setStudents((prev) =>
        prev.map((s) => {
          const rec = records[s.id];
          if (!rec) return s;
          return {
            ...s,
            attendance: rec.attendance,
            status: rec.status,
          };
        })
      );
    }
  };

  const periodTitle = useMemo(() => {
    switch (reportPeriod) {
      case "past_day":
        return `BÁO CÁO TỔNG HỢP NGÀY ${selectedPastDateFormatted.toUpperCase()} (ĐÃ GHI CHÉP)`;
      case "day":
        return `BÁO CÁO TỔNG HỢP NGÀY ${todayFormatted.toUpperCase()}`;
      case "week":
        return `BÁO CÁO TỔNG HỢP ${currentWeek.label.toUpperCase()} (${currentWeek.rangeText.toUpperCase()})`;
      case "month":
        return `BÁO CÁO TỔNG HỢP ${currentMonth.title.toUpperCase()}`;
      case "semester":
        return `BÁO CÁO TỔNG HỢP HỌC KỲ I (NĂM HỌC ${classInfo.year})`;
    }
  }, [reportPeriod, selectedPastDateFormatted, todayFormatted, currentWeek, currentMonth, classInfo.year]);

  const periodSubtitle = useMemo(() => {
    switch (reportPeriod) {
      case "past_day":
        return `Dữ liệu lịch sử đã ghi chép ngày: ${selectedPastDateFull} • Lớp ${classInfo.className}`;
      case "day":
        return `Thời điểm báo cáo thực tế: ${todayFull} • Lớp ${classInfo.className}`;
      case "week":
        return `${currentWeek.rangeText} • Năm học ${classInfo.year} • Lớp ${classInfo.className}`;
      case "month":
        return `Tháng 09/2026 • Năm học ${classInfo.year} • Lớp ${classInfo.className}`;
      case "semester":
        return `Học kỳ I (${classInfo.year}) • Lớp ${classInfo.className}`;
    }
  }, [reportPeriod, selectedPastDateFull, todayFull, currentWeek, classInfo.year, classInfo.className]);

  const stats = useMemo(() => {
    let present = 0;
    let goodStatus = 0;
    let needCare = 0;
    let totalStars = 0;
    let totalMath = 0;
    let totalVietnamese = 0;

    students.forEach((s) => {
      let att = s.attendance;
      let st = s.status;
      let stars = s.stars || 10;

      if (reportPeriod === "past_day") {
        const rec = activePastRecords[s.id] || { attendance: "Có mặt", status: "Tốt", stars: 2, note: "" };
        att = rec.attendance;
        st = rec.status;
        stars = rec.stars;
      } else if (reportPeriod === "day") {
        stars = Math.max(1, Math.round(stars * 0.15) + (s.attendance === "Có mặt" ? 1 : 0));
      } else if (reportPeriod === "week") {
        stars = Math.max(2, Math.round(stars * 0.45));
      }

      if (att === "Có mặt") present++;
      if (st === "Tốt" || st === "Tiến bộ") goodStatus++;
      if (st === "Cần quan tâm") needCare++;
      
      totalStars += stars;
      totalMath += s.mathScore || 8;
      totalVietnamese += s.vietnameseScore || 8;
    });

    const total = students.length;
    return {
      total,
      present,
      presentRate: total > 0 ? Math.round((present / total) * 100) : 0,
      goodStatusRate: total > 0 ? Math.round((goodStatus / total) * 100) : 0,
      needCare,
      avgStars: total > 0 ? (reportPeriod === "past_day" ? (totalStars / total).toFixed(1) : Math.round(totalStars / total)) : 0,
      avgMath: total > 0 ? (totalMath / total).toFixed(1) : "0",
      avgVietnamese: total > 0 ? (totalVietnamese / total).toFixed(1) : "0",
    };
  }, [students, reportPeriod, activePastRecords]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportComprehensiveExcel = () => {
    try {
      const activeDateStr = reportPeriod === "past_day" ? selectedPastDateFormatted : todayFormatted;
      const data = students.map((s, idx) => {
        let att = s.attendance;
        let st = s.status;
        let stars = s.stars || 10;
        let note = s.aiComment || s.notes || "Hoàn thành tốt.";

        if (reportPeriod === "past_day") {
          const rec = activePastRecords[s.id] || { attendance: "Có mặt", status: "Tốt", stars: 2, note: "" };
          att = rec.attendance;
          st = rec.status;
          stars = rec.stars;
          note = rec.note || "Hoàn thành tốt nhiệm vụ học tập trong ngày.";
        } else if (reportPeriod === "day") {
          stars = Math.max(1, Math.round(stars * 0.15) + (s.attendance === "Có mặt" ? 1 : 0));
        } else if (reportPeriod === "week") {
          stars = Math.max(2, Math.round(stars * 0.45));
        }

        return {
          STT: idx + 1,
          "Họ và tên": s.name,
          "Ngày sinh": s.dob,
          "Giới tính": s.gender,
          "Tổ": s.group,
          "SĐT Phụ huynh": s.parentPhone,
          "Chuyên cần": att,
          "Đánh giá hạnh kiểm": st,
          "Điểm Toán": s.mathScore || 0,
          "Điểm Tiếng Việt": s.vietnameseScore || 0,
          "Hoa điểm 10": stars,
          "Nhận xét ngày": note,
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BaoCaoTongHop");
      const cleanDate = activeDateStr.replace(/\//g, "-");
      XLSX.writeFile(wb, `Bao_cao_${classInfo.className}_${reportPeriod}_${cleanDate}.xlsx`);
      showToast(`Đã xuất file báo cáo theo ngày (${activeDateStr})!`);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xuất file báo cáo", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#6D28D9]" /> Báo Cáo & Thống Kê Tổng Hợp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo toàn diện lớp {classInfo.className} • Ngày thực tế: <strong className="text-slate-700">{todayFull}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> In báo cáo
          </button>
          <button
            onClick={handleExportComprehensiveExcel}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-purple-900/10 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Xuất Excel ({reportPeriod === "past_day" ? selectedPastDateFormatted : todayFormatted})
          </button>
        </div>
      </div>

      {/* Period Selection Controls */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
          <span className="text-slate-400">Khung thời gian báo cáo:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          {/* Nút Chọn ngày trong năm học */}
          <button
            id="btn-report-past-days"
            onClick={() => {
              setReportPeriod("past_day");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              reportPeriod === "past_day"
                ? "bg-[#6D28D9] text-white shadow-xs"
                : "bg-white text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 shadow-2xs"
            }`}
            title="Xem báo cáo theo bất kỳ ngày nào trong toàn bộ năm học (2026 - 2027)"
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            <span>Các ngày trong năm</span>
            {reportPeriod === "past_day" ? (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                {selectedPastDateFormatted}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                ({selectedPastDateFormatted})
              </span>
            )}
          </button>

          {/* Nút Cập nhật ghi chép toàn bộ các ngày */}
          <button
            id="btn-update-past-records"
            onClick={() => setShowPastDaysModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-purple-800 bg-purple-100/90 hover:bg-purple-200 border border-purple-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Mở bảng cập nhật và chỉnh sửa ghi chép toàn bộ các ngày trong năm học"
          >
            <FileEdit className="w-3.5 h-3.5 text-purple-700" />
            <span>Cập nhật ghi chép cả năm</span>
          </button>

          <button
            onClick={() => setReportPeriod("day")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              reportPeriod === "day"
                ? "bg-[#6D28D9] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-300" /> Hôm nay ({todayFormatted})
          </button>
          <button
            onClick={() => setReportPeriod("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              reportPeriod === "week"
                ? "bg-[#6D28D9] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Tuần này ({currentWeek.label})
          </button>
          <button
            onClick={() => setReportPeriod("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              reportPeriod === "month"
                ? "bg-[#6D28D9] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {currentMonth.title}
          </button>
          <button
            onClick={() => setReportPeriod("semester")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              reportPeriod === "semester"
                ? "bg-[#6D28D9] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cả Học kỳ I
          </button>
        </div>
      </div>

      {/* Banner khi xem báo cáo ngày bất kỳ trong năm học */}
      {reportPeriod === "past_day" && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-amber-50/70 border border-purple-200/90 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs text-slate-800 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-800 text-sm">
                  Báo cáo ngày: <span className="text-[#6D28D9] font-extrabold">{selectedPastDateFull}</span>
                </p>
                {dailyHistory[selectedPastDate] ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    ✓ Đã có dữ liệu ghi chép
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    Dữ liệu cơ sở (Sẵn sàng ghi chép)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bạn có thể xem và cập nhật dữ liệu điểm danh, nề nếp thi đua, hoa điểm 10 cho <strong>toàn bộ các ngày trong năm học 2026 - 2027</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Step Prev / Next Buttons */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
              <button
                onClick={() => {
                  setSelectedPastDate(stepDateISO(selectedPastDate, -1));
                  setReportPeriod("past_day");
                }}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 border-r border-slate-200 transition flex items-center gap-0.5 cursor-pointer"
                title="Xem ngày hôm trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trước
              </button>
              <button
                onClick={() => {
                  setSelectedPastDate(stepDateISO(selectedPastDate, 1));
                  setReportPeriod("past_day");
                }}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-0.5 cursor-pointer"
                title="Xem ngày hôm sau"
              >
                Sau <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Full-Year Vietnamese Date Picker (DD/MM/YYYY) */}
            <VietnameseDatePicker
              value={selectedPastDate}
              onChange={(newDateISO) => {
                setSelectedPastDate(newDateISO);
                setReportPeriod("past_day");
              }}
              label="Chọn ngày:"
              idPrefix="report-date-picker"
            />

            {/* Dropdown with all School Year Milestones & Recorded Dates */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-300 shadow-2xs max-w-[210px] sm:max-w-[260px]">
              <select
                value={selectedPastDate}
                onChange={(e) => {
                  setSelectedPastDate(e.target.value);
                  setReportPeriod("past_day");
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full truncate"
              >
                <optgroup label="Mốc tiêu biểu & ngày đã ghi chép">
                  {availablePastDates.map((d) => (
                    <option key={d.dateISO} value={d.dateISO}>
                      {d.isRecorded ? "✅ " : "📅 "} {d.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Edit current date button */}
            <button
              onClick={() => setShowPastDaysModal(true)}
              className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Chỉnh sửa điểm danh, nề nếp, sao và nhận xét cho ngày này"
            >
              <FileEdit className="w-3.5 h-3.5" /> Chỉnh sửa ngày này
            </button>

            {/* Return to today */}
            <button
              onClick={() => setReportPeriod("day")}
              className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Quay lại báo cáo ngày hôm nay"
            >
              Về hôm nay ({todayFormatted})
            </button>
          </div>
        </div>
      )}

      {/* Printable Report Sheet */}
      <div className="bg-white rounded-[24px] p-8 shadow-xs border border-slate-100 space-y-6">
        {/* Formal Header */}
        <div className="text-center border-b border-slate-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            {classInfo.school}
          </p>
          <h3 className="text-xl font-bold text-slate-800 mt-1 uppercase">
            {periodTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {periodSubtitle} • Sĩ số: <strong>{classInfo.totalStudents} học sinh</strong>
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            Giáo viên chủ nhiệm: <strong className="text-slate-800">{classInfo.teacherName}</strong>
          </p>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
            <p className="text-xs font-semibold text-purple-700">Tỷ lệ chuyên cần</p>
            <p className="text-2xl font-black text-[#6D28D9] mt-1">
              {stats.presentRate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.present}/{stats.total} học sinh
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
            <p className="text-xs font-semibold text-emerald-700">Học sinh Tốt/Tiến bộ</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {stats.goodStatusRate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Nề nếp & rèn luyện
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
            <p className="text-xs font-semibold text-indigo-700">Điểm TB Toán / Văn</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">
              {stats.avgMath} / {stats.avgVietnamese}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Học lực lớp
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
            <p className="text-xs font-semibold text-amber-700">TB Hoa điểm 10</p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {stats.avgStars} ⭐
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {reportPeriod === "day" ? "Trong ngày hôm nay" : reportPeriod === "past_day" ? `Trong ngày ${selectedPastDateFormatted}` : "Trong kỳ báo cáo"}
            </p>
          </div>
        </div>

        {/* Class Roster Summary Table */}
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-3">
            Bảng chi tiết học sinh lớp {classInfo.className}
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-2.5 text-center w-10">STT</th>
                  <th className="p-2.5">Họ và Tên</th>
                  <th className="p-2.5 text-center">Tổ</th>
                  <th className="p-2.5 text-center">Điểm danh</th>
                  <th className="p-2.5 text-center">Toán</th>
                  <th className="p-2.5 text-center">Văn</th>
                  <th className="p-2.5 text-center">Thi đua</th>
                  <th className="p-2.5">Nhận xét tóm tắt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => {
                  let att = s.attendance;
                  let stars = s.stars || 10;
                  let note = s.aiComment || s.notes || "Hoàn thành tốt nhiệm vụ học tập.";

                  if (reportPeriod === "past_day") {
                    const rec = activePastRecords[s.id] || { attendance: "Có mặt", status: "Tốt", stars: 2, note: "" };
                    att = rec.attendance;
                    stars = rec.stars;
                    note = rec.note || "Hoàn thành tốt nhiệm vụ học tập trong ngày.";
                  } else if (reportPeriod === "day") {
                    stars = Math.max(1, Math.round(stars * 0.15) + (s.attendance === "Có mặt" ? 1 : 0));
                  } else if (reportPeriod === "week") {
                    stars = Math.max(2, Math.round(stars * 0.45));
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center text-slate-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">{s.name}</td>
                      <td className="p-2.5 text-center">Tổ {s.group}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            att === "Có mặt"
                              ? "bg-emerald-50 text-emerald-700"
                              : att === "Vắng phép"
                              ? "bg-amber-50 text-amber-700"
                              : att === "Vắng không phép"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {att}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-800">
                        {s.mathScore || 9}
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-800">
                        {s.vietnameseScore || 8.5}
                      </td>
                      <td className="p-2.5 text-center font-bold text-amber-600">
                        {stars} ⭐
                      </td>
                      <td className="p-2.5 text-slate-600 italic truncate max-w-xs">
                        {note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Signature Line with Real Date */}
        <div className="pt-6 flex justify-end">
          <div className="text-center w-64 space-y-12">
            <div>
              <p className="text-xs text-slate-500">
                {reportPeriod === "past_day" ? selectedPastDateFormal : formalDate}
              </p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 uppercase">
                Giáo viên chủ nhiệm
              </p>
            </div>
            <p className="text-xs font-bold text-slate-800 pt-6">
              {classInfo.teacherName}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Cập nhật các ngày trước đã ghi chép */}
      <UpdatePastRecordsModal
        isOpen={showPastDaysModal}
        onClose={() => setShowPastDaysModal(false)}
        students={students}
        initialDateISO={selectedPastDate}
        dailyHistory={dailyHistory}
        onSaveDateRecord={handleSaveDateRecord}
        onViewReportForDate={(dateISO) => {
          setSelectedPastDate(dateISO);
          setReportPeriod("past_day");
        }}
        showToast={showToast}
      />
    </div>
  );
};

