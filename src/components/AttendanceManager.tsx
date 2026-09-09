import React, { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  FileText,
  XCircle,
  Clock,
  Save,
  Download,
  Calendar,
  Sparkles,
  Phone,
  MessageSquareText,
  Share2,
  Copy,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Student, ClassInfo } from "../types.ts";
import { getCurrentDateISO, formatDateVi, formatFullDateVi } from "../utils/dateUtils.ts";

interface AttendanceManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classInfo?: ClassInfo;
  onNavigateToParent?: (studentId: number) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  setStudents,
  classInfo,
  onNavigateToParent,
  showToast,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => getCurrentDateISO());
  const [showReportModal, setShowReportModal] = useState(false);

  // Local state map for attendance statuses and notes
  const [attendanceMap, setAttendanceMap] = useState<
    Record<number, { status: Student["attendance"]; note: string }>
  >(() => {
    const map: Record<number, { status: Student["attendance"]; note: string }> = {};
    students.forEach((s) => {
      map[s.id] = {
        status: s.attendance || "Có mặt",
        note: "",
      };
    });
    return map;
  });

  const statuses: Array<{
    id: Student["attendance"];
    label: string;
    color: string;
    activeClass: string;
    icon: any;
  }> = [
    {
      id: "Có mặt",
      label: "Có mặt",
      color: "emerald",
      activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
      icon: CheckCircle2,
    },
    {
      id: "Vắng phép",
      label: "Vắng phép",
      color: "amber",
      activeClass: "bg-amber-500 text-white shadow-md shadow-amber-500/20",
      icon: FileText,
    },
    {
      id: "Vắng không phép",
      label: "Vắng K.phép",
      color: "rose",
      activeClass: "bg-rose-600 text-white shadow-md shadow-rose-600/20",
      icon: XCircle,
    },
    {
      id: "Đi muộn",
      label: "Đi muộn",
      color: "indigo",
      activeClass: "bg-indigo-600 text-white shadow-md shadow-indigo-600/20",
      icon: Clock,
    },
  ];

  // Set All Students to a status
  const handleSetAll = (status: Student["attendance"]) => {
    const updated = { ...attendanceMap };
    students.forEach((s) => {
      updated[s.id] = {
        ...(updated[s.id] || { note: "" }),
        status,
      };
    });
    setAttendanceMap(updated);
    showToast(`Đã chuyển toàn bộ lớp sang trạng thái "${status}"!`, "info");
  };

  // Save changes
  const handleSave = () => {
    const updatedStudents = students.map((s) => ({
      ...s,
      attendance: attendanceMap[s.id]?.status || s.attendance,
      notes: attendanceMap[s.id]?.note
        ? `${s.notes ? s.notes + " | " : ""}[${selectedDate}]: ${attendanceMap[s.id].note}`
        : s.notes,
    }));

    setStudents(updatedStudents);
    showToast(`Đã lưu bảng điểm danh ngày ${selectedDate} thành công!`);
  };

  // Export Attendance to Excel
  const handleExportAttendance = () => {
    try {
      const rows = students.map((s, idx) => ({
        STT: idx + 1,
        "Họ và tên": s.name,
        Tổ: s.group,
        "Ngày điểm danh": selectedDate,
        "Trạng thái": attendanceMap[s.id]?.status || s.attendance,
        "Ghi chú / Lý do vắng": attendanceMap[s.id]?.note || "",
        "SĐT Phụ huynh": s.parentPhone,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DiemDanhNgay");
      XLSX.writeFile(wb, `Diem_danh_${selectedDate}.xlsx`);
      showToast("Đã xuất file điểm danh Excel!");
    } catch (err) {
      console.error(err);
      showToast("Không thể xuất file điểm danh", "error");
    }
  };

  // Statistics
  const summary = React.useMemo(() => {
    let present = 0;
    let absentExcused = 0;
    let absentUnexcused = 0;
    let late = 0;

    students.forEach((s) => {
      const st = attendanceMap[s.id]?.status || s.attendance;
      if (st === "Có mặt") present++;
      else if (st === "Vắng phép") absentExcused++;
      else if (st === "Vắng không phép") absentUnexcused++;
      else if (st === "Đi muộn") late++;
    });

    const total = students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absentExcused, absentUnexcused, late, rate };
  }, [students, attendanceMap]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-[#6D28D9]" /> Sổ Điểm Danh Lớp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chuyên cần, cập nhật sĩ số và lý do vắng học mỗi ngày
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker & Quick Today Button */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Calendar className="w-4 h-4 text-[#1c2e4a]" />
              <input
                id="attendance-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              />
            </div>
            <button
              id="btn-attendance-today"
              onClick={() => setSelectedDate(getCurrentDateISO())}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedDate === getCurrentDateISO()
                  ? "bg-[#1c2e4a] text-white border-[#1c2e4a] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
              title="Đặt ngày báo cáo về hôm nay"
            >
              Hôm nay ({formatDateVi().slice(0, 5)})
            </button>
          </div>

          <button
            id="btn-attendance-all-present"
            onClick={() => handleSetAll("Có mặt")}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Có mặt cả lớp
          </button>

          <button
            id="btn-attendance-report"
            onClick={() => setShowReportModal(true)}
            className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Báo cáo BGH / Zalo
          </button>

          <button
            id="btn-export-attendance-excel"
            onClick={handleExportAttendance}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </button>

          <button
            id="btn-save-attendance"
            onClick={handleSave}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-purple-900/10 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Lưu điểm danh
          </button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-400">Sĩ số lớp</p>
          <p className="text-xl font-bold text-slate-800 mt-0.5">{summary.total}</p>
        </div>
        <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-emerald-700">Có mặt</p>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">
            {summary.present}{" "}
            <span className="text-xs font-normal text-emerald-600">
              ({summary.rate}%)
            </span>
          </p>
        </div>
        <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-amber-700">Vắng có phép</p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">
            {summary.absentExcused}
          </p>
        </div>
        <div className="bg-rose-50/60 rounded-2xl p-3.5 border border-rose-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-rose-700">Vắng K.phép</p>
          <p className="text-xl font-bold text-rose-700 mt-0.5">
            {summary.absentUnexcused}
          </p>
        </div>
        <div className="bg-indigo-50/60 rounded-2xl p-3.5 border border-indigo-100 shadow-xs text-center col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-indigo-700">Đi muộn</p>
          <p className="text-xl font-bold text-indigo-700 mt-0.5">
            {summary.late}
          </p>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-[24px] shadow-xs border border-slate-100 divide-y divide-slate-100 overflow-hidden">
        {students.map((s, idx) => {
          const currentStatus = attendanceMap[s.id]?.status || s.attendance;
          const currentNote = attendanceMap[s.id]?.note ?? "";
          const isNotPresent = currentStatus !== "Có mặt";

          return (
            <div
              key={s.id}
              className={`p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                isNotPresent ? "bg-amber-50/20" : "hover:bg-slate-50/50"
              }`}
            >
              {/* Student basic info */}
              <div className="flex items-center gap-3.5 min-w-[200px]">
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                    s.gender === "Nam"
                      ? "bg-gradient-to-tr from-[#623CEB] to-[#8B5CF6]"
                      : "bg-gradient-to-tr from-pink-500 to-rose-400"
                  }`}
                >
                  {s.name.charAt(s.name.lastIndexOf(" ") + 1) || "A"}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Tổ {s.group} • PH: {s.parentPhone || "Chưa có SĐT"}
                  </p>
                </div>
              </div>

              {/* Status Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 ml-9 md:ml-0">
                {statuses.map((st) => {
                  const Icon = st.icon;
                  const isSelected = currentStatus === st.id;

                  return (
                    <button
                      key={st.id}
                      onClick={() =>
                        setAttendanceMap((prev) => ({
                          ...prev,
                          [s.id]: {
                            ...(prev[s.id] || { note: "" }),
                            status: st.id,
                          },
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? st.activeClass
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Reason / Note input & Quick parent alert */}
              <div className="w-full md:w-80 ml-9 md:ml-0 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={
                    isNotPresent ? "Nhập lý do vắng / đi muộn..." : "Ghi chú thêm..."
                  }
                  value={currentNote}
                  onChange={(e) =>
                    setAttendanceMap((prev) => ({
                      ...prev,
                      [s.id]: {
                        ...(prev[s.id] || { status: currentStatus }),
                        note: e.target.value,
                      },
                    }))
                  }
                  className={`flex-1 px-3 py-1.5 rounded-xl text-xs outline-none transition border ${
                    isNotPresent
                      ? "bg-white border-amber-300 focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
                      : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-[#6D28D9] text-slate-600"
                  }`}
                />

                {isNotPresent && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {s.parentPhone && (
                      <a
                        href={`tel:${s.parentPhone}`}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        title="Gọi phụ huynh"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {onNavigateToParent && (
                      <button
                        onClick={() => onNavigateToParent(s.id)}
                        className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Nhắn tin phụ huynh"
                      >
                        <MessageSquareText className="w-3 h-3" /> Báo PH
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Báo Cáo Sĩ Số Nhanh (Zalo / BGH) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-[#623CEB] to-[#8B5CF6] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Báo Cáo Sĩ Số Nhanh</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Bản tin được định dạng chuẩn để Thầy/Cô gửi ngay vào nhóm Zalo Ban Giám Hiệu hoặc Nhóm Phụ huynh:
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
{`📢 BÁO CÁO ĐIỂM DANH LỚP ${classInfo?.className || "3A1"}
📅 Ngày: ${formatFullDateVi(selectedDate)}
👨‍🏫 GVCN: ${classInfo?.teacherName || "Thầy Trần Đông - AI Trainer"}
────────────────────
👥 Sĩ số: ${summary.total} học sinh
✅ Có mặt: ${summary.present} (${summary.rate}%)
⚠️ Vắng có phép: ${summary.absentExcused}
❌ Vắng không phép: ${summary.absentUnexcused}
⏰ Đi muộn: ${summary.late}
${
  students.filter((s) => (attendanceMap[s.id]?.status || s.attendance) !== "Có mặt").length > 0
    ? "\n📋 Danh sách vắng/đi muộn:\n" +
      students
        .filter((s) => (attendanceMap[s.id]?.status || s.attendance) !== "Có mặt")
        .map(
          (s) =>
            `- ${s.name} (${attendanceMap[s.id]?.status || s.attendance}${
              attendanceMap[s.id]?.note ? ": " + attendanceMap[s.id].note : ""
            })`
        )
        .join("\n")
    : "\n🎉 Cả lớp đi học đầy đủ, đúng giờ!"
}`}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const text = `📢 BÁO CÁO ĐIỂM DANH LỚP ${classInfo?.className || "3A1"}\n📅 Ngày: ${formatFullDateVi(selectedDate)}\n👨‍🏫 GVCN: ${classInfo?.teacherName || "Thầy Trần Đông - AI Trainer"}\n────────────────────\n👥 Sĩ số: ${summary.total} học sinh\n✅ Có mặt: ${summary.present} (${summary.rate}%)\n⚠️ Vắng có phép: ${summary.absentExcused}\n❌ Vắng không phép: ${summary.absentUnexcused}\n⏰ Đi muộn: ${summary.late}\n${
                      students.filter((s) => (attendanceMap[s.id]?.status || s.attendance) !== "Có mặt").length > 0
                        ? "\n📋 Danh sách vắng/đi muộn:\n" +
                          students
                            .filter((s) => (attendanceMap[s.id]?.status || s.attendance) !== "Có mặt")
                            .map(
                              (s) =>
                                `- ${s.name} (${attendanceMap[s.id]?.status || s.attendance}${
                                  attendanceMap[s.id]?.note ? ": " + attendanceMap[s.id].note : ""
                                })`
                            )
                            .join("\n")
                        : "\n🎉 Cả lớp đi học đầy đủ, đúng giờ!"
                    }`;
                    navigator.clipboard.writeText(text);
                    showToast("Đã sao chép báo cáo điểm danh vào clipboard!");
                  }}
                  className="flex-1 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Sao chép gửi Zalo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
