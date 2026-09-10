import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  History,
  CheckCircle2,
  FileText,
  XCircle,
  Clock,
  Award,
  Save,
  RotateCcw,
  Calendar,
  Sparkles,
  Eye,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Copy,
} from "lucide-react";
import { Student, DailyRecordEntry, DailyHistoryMap } from "../types.ts";
import {
  formatDateVi,
  formatDayOfWeekVi,
  formatFullDateVi,
  stepDateISO,
  getSchoolYearMonths,
} from "../utils/dateUtils.ts";
import { getDailyRecordForDate, getAvailableRecordedDates } from "../data/pastRecordsData.ts";
import { VietnameseDatePicker } from "./VietnameseDatePicker.tsx";

interface UpdatePastRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialDateISO?: string;
  dailyHistory: DailyHistoryMap;
  onSaveDateRecord: (dateISO: string, records: Record<number, DailyRecordEntry>) => void;
  onViewReportForDate: (dateISO: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const UpdatePastRecordsModal: React.FC<UpdatePastRecordsModalProps> = ({
  isOpen,
  onClose,
  students,
  initialDateISO = "2026-09-10",
  dailyHistory,
  onSaveDateRecord,
  onViewReportForDate,
  showToast,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDateISO);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<number | 0>(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Local editing copy for the currently selected date
  const [currentEditRecords, setCurrentEditRecords] = useState<Record<number, DailyRecordEntry>>({});
  const [isDirty, setIsDirty] = useState(false);

  // School year months (Sept 2026 - May 2027)
  const schoolMonths = useMemo(() => getSchoolYearMonths(), []);

  // Sync initial editing record when modal opens or date changes
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDateISO);
      const existing = getDailyRecordForDate(initialDateISO, dailyHistory, students);
      setCurrentEditRecords(JSON.parse(JSON.stringify(existing)));
      setIsDirty(false);
    }
  }, [isOpen, initialDateISO, dailyHistory, students]);

  // Handle date switch inside modal
  const handleDateChange = (newDateISO: string) => {
    if (newDateISO === selectedDate) return;
    setSelectedDate(newDateISO);
    const existing = getDailyRecordForDate(newDateISO, dailyHistory, students);
    setCurrentEditRecords(JSON.parse(JSON.stringify(existing)));
    setIsDirty(false);
  };

  // Step to previous / next day
  const handleStepDay = (delta: number) => {
    const nextDate = stepDateISO(selectedDate, delta);
    handleDateChange(nextDate);
  };

  // Date formatted strings
  const selectedDateObj = useMemo(() => {
    const parts = selectedDate.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }, [selectedDate]);

  const selectedDateFormatted = useMemo(() => formatDateVi(selectedDateObj), [selectedDateObj]);
  const selectedDayOfWeek = useMemo(() => formatDayOfWeekVi(selectedDateObj), [selectedDateObj]);
  const selectedFullDate = useMemo(() => formatFullDateVi(selectedDateObj), [selectedDateObj]);

  // Pre-recorded dates and milestone list
  const recordedDatesList = useMemo(() => {
    const list = getAvailableRecordedDates(dailyHistory);
    if (!list.some((item) => item.dateISO === selectedDate)) {
      const parts = selectedDate.split("-");
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dateFormatted = formatDateVi(d);
      const dayOfWeek = formatDayOfWeekVi(d);
      list.unshift({
        dateISO: selectedDate,
        label: `${dateFormatted} (${dayOfWeek}) - Ngày đang chọn`,
        dateFormatted,
        dayOfWeek,
        isRecorded: !!dailyHistory[selectedDate],
      });
    }
    return list;
  }, [dailyHistory, selectedDate]);

  // Update a single student's field
  const updateStudentEntry = (
    studentId: number,
    field: keyof DailyRecordEntry,
    value: any
  ) => {
    setCurrentEditRecords((prev) => {
      const current = prev[studentId] || {
        attendance: "Có mặt",
        status: "Tốt",
        stars: 2,
        note: "",
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: value,
        },
      };
    });
    setIsDirty(true);
  };

  // Batch actions
  const handleSetAllAttendance = (status: DailyRecordEntry["attendance"]) => {
    setCurrentEditRecords((prev) => {
      const updated: Record<number, DailyRecordEntry> = {};
      students.forEach((s) => {
        const cur = prev[s.id] || { attendance: "Có mặt", status: "Tốt", stars: 2, note: "" };
        updated[s.id] = { ...cur, attendance: status };
      });
      return updated;
    });
    setIsDirty(true);
    showToast(`Đã chuyển toàn bộ lớp sang "${status}" ngày ${selectedDateFormatted}!`, "info");
  };

  const handleSetAllStatus = (status: DailyRecordEntry["status"]) => {
    setCurrentEditRecords((prev) => {
      const updated: Record<number, DailyRecordEntry> = {};
      students.forEach((s) => {
        const cur = prev[s.id] || { attendance: "Có mặt", status: "Tốt", stars: 2, note: "" };
        updated[s.id] = { ...cur, status };
      });
      return updated;
    });
    setIsDirty(true);
    showToast(`Đã đánh giá nề nếp toàn bộ lớp là "${status}"!`, "info");
  };

  const handleBonusAllStars = (delta: number) => {
    setCurrentEditRecords((prev) => {
      const updated: Record<number, DailyRecordEntry> = {};
      students.forEach((s) => {
        const cur = prev[s.id] || { attendance: "Có mặt", status: "Tốt", stars: 2, note: "" };
        updated[s.id] = { ...cur, stars: Math.max(0, (cur.stars || 0) + delta) };
      });
      return updated;
    });
    setIsDirty(true);
    showToast(`Đã tặng ${delta > 0 ? "+" : ""}${delta} hoa điểm 10 cho cả lớp ngày ${selectedDateFormatted}!`, "success");
  };

  // Reset to original
  const handleReset = () => {
    const existing = getDailyRecordForDate(selectedDate, dailyHistory, students);
    setCurrentEditRecords(JSON.parse(JSON.stringify(existing)));
    setIsDirty(false);
    showToast("Đã khôi phục dữ liệu ban đầu của ngày!", "info");
  };

  // Save handler
  const handleSave = () => {
    onSaveDateRecord(selectedDate, currentEditRecords);
    setIsDirty(false);
    showToast(`Đã lưu cập nhật ghi chép ngày ${selectedDateFormatted} thành công!`, "success");
  };

  // Save and view report
  const handleSaveAndView = () => {
    onSaveDateRecord(selectedDate, currentEditRecords);
    setIsDirty(false);
    showToast(`Đã lưu và chuyển sang báo cáo ngày ${selectedDateFormatted}!`, "success");
    onViewReportForDate(selectedDate);
    onClose();
  };

  // Quick statistics for current records
  const summary = useMemo(() => {
    let present = 0;
    let absentExcused = 0;
    let absentUnexcused = 0;
    let late = 0;
    let totalStars = 0;

    students.forEach((s) => {
      const rec = currentEditRecords[s.id] || { attendance: "Có mặt", status: "Tốt", stars: 2, note: "" };
      if (rec.attendance === "Có mặt") present++;
      else if (rec.attendance === "Vắng phép") absentExcused++;
      else if (rec.attendance === "Vắng không phép") absentUnexcused++;
      else if (rec.attendance === "Đi muộn") late++;
      totalStars += rec.stars || 0;
    });

    const total = students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const avgStars = total > 0 ? (totalStars / total).toFixed(1) : "0";

    return { total, present, absentExcused, absentUnexcused, late, rate, avgStars };
  }, [students, currentEditRecords]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentPhone.includes(searchQuery);
      const matchGroup = groupFilter === 0 || s.group === groupFilter;
      
      const rec = currentEditRecords[s.id];
      const matchStatus = statusFilter === "all" ||
        (statusFilter === "present" && rec?.attendance === "Có mặt") ||
        (statusFilter === "absent" && (rec?.attendance === "Vắng phép" || rec?.attendance === "Vắng không phép")) ||
        (statusFilter === "late" && rec?.attendance === "Đi muộn");

      return matchQuery && matchGroup && matchStatus;
    });
  }, [students, searchQuery, groupFilter, statusFilter, currentEditRecords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2">
              <CalendarDays className="w-3.5 h-3.5" /> Quản lý ghi chép toàn bộ các ngày trong năm học (2026 - 2027)
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">
              Cập Nhật Ghi Chép Các Ngày Trong Năm
            </h3>
            <p className="text-xs md:text-sm text-purple-200 mt-1">
              Đang chọn ngày:{" "}
              <strong className="text-amber-300 underline font-semibold text-sm md:text-base">
                {selectedFullDate}
              </strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Across Entire School Year */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-3 flex-shrink-0">
          
          {/* Row 1: Month Quick Jump Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] whitespace-nowrap mr-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-600" /> Tháng:
            </span>
            {schoolMonths.map((m) => {
              const isCurrentMonth = selectedDate.startsWith(m.key);
              return (
                <button
                  key={m.key}
                  onClick={() => handleDateChange(`${m.key}-05`)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    isCurrentMonth
                      ? "bg-purple-700 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-purple-50 border border-slate-200"
                  }`}
                >
                  {m.label.replace("/202", "/")}
                </button>
              );
            })}
          </div>

          {/* Row 2: Stepping, Date Input, and Milestones Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/70">
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Prev / Next Day Buttons */}
              <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => handleStepDay(-1)}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 border-r border-slate-200 transition flex items-center gap-1 cursor-pointer"
                  title="Chuyển sang ngày hôm trước"
                >
                  <ChevronLeft className="w-4 h-4" /> Hôm trước
                </button>
                <button
                  onClick={() => handleStepDay(1)}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-1 cursor-pointer"
                  title="Chuyển sang ngày hôm sau"
                >
                  Hôm sau <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Full-Year Vietnamese Date Picker (DD/MM/YYYY) */}
              <VietnameseDatePicker
                value={selectedDate}
                onChange={(newDateISO) => handleDateChange(newDateISO)}
                label="Chọn ngày:"
                idPrefix="modal-date-picker"
              />

              {/* Milestones & Recorded Dates Dropdown */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1 shadow-2xs max-w-xs">
                <select
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full truncate"
                >
                  <optgroup label="Các mốc tiêu biểu & ngày đã ghi chép">
                    {recordedDatesList.map((item) => (
                      <option key={item.dateISO} value={item.dateISO}>
                        {item.isRecorded ? "✅ " : "📅 "} {item.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

            </div>

            {/* Quick Summary Badge for this date */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs">
              <span className="text-emerald-700 font-bold">
                Có mặt: {summary.present}/{summary.total} ({summary.rate}%)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700">
                Vắng: {summary.absentExcused + summary.absentUnexcused}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-700">
                Muộn: {summary.late}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600 font-bold">
                ⭐ {summary.avgStars}
              </span>
            </div>
          </div>
        </div>

        {/* Batch Operations Toolbar */}
        <div className="p-3 px-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Tác vụ nhanh ngày này:</span>
            <button
              onClick={() => handleSetAllAttendance("Có mặt")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tất cả Có mặt
            </button>
            <button
              onClick={() => handleSetAllStatus("Tốt")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition cursor-pointer flex items-center gap-1"
            >
              <Award className="w-3 h-3 text-purple-600" /> Nề nếp Tốt
            </button>
            <button
              onClick={() => handleBonusAllStars(1)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> +1 Hoa điểm 10
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
              title="Khôi phục dữ liệu ban đầu ngày này"
            >
              <RotateCcw className="w-3 h-3" /> Hoàn tác
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học sinh..."
                className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 w-36 sm:w-44 bg-slate-50"
              />
            </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(Number(e.target.value))}
              className="py-1 px-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={0}>Tất cả tổ</option>
              <option value={1}>Tổ 1</option>
              <option value={2}>Tổ 2</option>
              <option value={3}>Tổ 3</option>
              <option value={4}>Tổ 4</option>
            </select>
          </div>
        </div>

        {/* Students Editable List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="text-xs text-slate-500 font-semibold px-1 flex items-center justify-between">
            <span>Danh sách {filteredStudents.length} học sinh (Ngày {selectedDateFormatted}):</span>
            {isDirty && (
              <span className="text-amber-600 font-bold flex items-center gap-1 animate-pulse">
                ⚠️ Có thay đổi chưa lưu
              </span>
            )}
          </div>

          <div className="space-y-2">
            {filteredStudents.map((s, idx) => {
              const entry = currentEditRecords[s.id] || {
                attendance: "Có mặt",
                status: "Tốt",
                stars: 2,
                note: "",
              };

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    entry.attendance === "Có mặt"
                      ? "bg-white border-slate-200 hover:border-purple-300"
                      : entry.attendance === "Vắng phép"
                      ? "bg-amber-50/50 border-amber-200"
                      : entry.attendance === "Vắng không phép"
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-indigo-50/50 border-indigo-200"
                  }`}
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{s.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        Tổ {s.group} • SĐT: {s.parentPhone}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Selector Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
                    <button
                      onClick={() => updateStudentEntry(s.id, "attendance", "Có mặt")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        entry.attendance === "Có mặt"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => updateStudentEntry(s.id, "attendance", "Vắng phép")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        entry.attendance === "Vắng phép"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Vắng phép
                    </button>
                    <button
                      onClick={() => updateStudentEntry(s.id, "attendance", "Vắng không phép")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        entry.attendance === "Vắng không phép"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Vắng K.phép
                    </button>
                    <button
                      onClick={() => updateStudentEntry(s.id, "attendance", "Đi muộn")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        entry.attendance === "Đi muộn"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Đi muộn
                    </button>
                  </div>

                  {/* Conduct Status */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 font-semibold">Nề nếp:</span>
                    <select
                      value={entry.status}
                      onChange={(e) => updateStudentEntry(s.id, "status", e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Tốt">Tốt</option>
                      <option value="Tiến bộ">Tiến bộ</option>
                      <option value="Bình thường">Bình thường</option>
                      <option value="Cần quan tâm">Cần quan tâm</option>
                    </select>
                  </div>

                  {/* Stars in Day */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-0.5">
                      ⭐ Sao:
                    </span>
                    <button
                      onClick={() => updateStudentEntry(s.id, "stars", Math.max(0, entry.stars - 1))}
                      className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-amber-700">
                      {entry.stars || 0}
                    </span>
                    <button
                      onClick={() => updateStudentEntry(s.id, "stars", (entry.stars || 0) + 1)}
                      className="w-5 h-5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold flex items-center justify-center text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Daily Note */}
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={entry.note || ""}
                      onChange={(e) => updateStudentEntry(s.id, "note", e.target.value)}
                      placeholder="Ghi chú / Nhận xét ngày này..."
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-400 rounded-xl px-3 py-1 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500">
            Hệ thống tự động lưu trữ độc lập từng ngày trong năm học • Bạn có thể chuyển sang ngày khác bất cứ lúc nào.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveAndView}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Xem báo cáo ngày này
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition shadow-md shadow-purple-900/20 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu cập nhật ngày {selectedDateFormatted}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
