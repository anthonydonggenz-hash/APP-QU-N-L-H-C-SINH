import React, { useState } from "react";
import { BookOpen, Award, Save, Download, Search, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Student } from "../types.ts";

interface LearningManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const LearningManager: React.FC<LearningManagerProps> = ({
  students,
  setStudents,
  showToast,
}) => {
  const [activeSubject, setActiveSubject] = useState<"math" | "vietnamese">("math");
  const [searchTerm, setSearchTerm] = useState("");

  const handleScoreChange = (studentId: number, field: "mathScore" | "vietnameseScore", val: number) => {
    const clamped = Math.max(0, Math.min(10, val));
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, [field]: clamped } : s))
    );
  };

  const handleSave = () => {
    showToast("Đã lưu bảng điểm đánh giá học tập thành công!");
  };

  const handleExport = () => {
    try {
      const data = students.map((s, idx) => ({
        STT: idx + 1,
        "Họ và tên": s.name,
        Tổ: s.group,
        "Điểm Toán": s.mathScore ?? 0,
        "Đánh giá Toán": (s.mathScore ?? 0) >= 9 ? "T" : (s.mathScore ?? 0) >= 6 ? "H" : "C",
        "Điểm Tiếng Việt": s.vietnameseScore ?? 0,
        "Đánh giá Tiếng Việt": (s.vietnameseScore ?? 0) >= 9 ? "T" : (s.vietnameseScore ?? 0) >= 6 ? "H" : "C",
        "Xếp loại chung": s.status,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BangDiemDinhKy");
      XLSX.writeFile(wb, "Bang_diem_hoc_tap_Lop3A1.xlsx");
      showToast("Đã xuất bảng điểm định kỳ thành file Excel!");
    } catch (err) {
      console.error(err);
      showToast("Không thể xuất file bảng điểm", "error");
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = React.useMemo(() => {
    let totalScore = 0;
    let excellent = 0;
    let good = 0;
    let average = 0;

    students.forEach((s) => {
      const score = activeSubject === "math" ? s.mathScore ?? 8 : s.vietnameseScore ?? 8;
      totalScore += score;
      if (score >= 9) excellent++;
      else if (score >= 7) good++;
      else average++;
    });

    const avg = students.length > 0 ? (totalScore / students.length).toFixed(1) : "0";
    return { avg, excellent, good, average };
  }, [students, activeSubject]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-[#6D28D9]" /> Đánh Giá Học Tập & Sổ Điểm
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đánh giá thường xuyên và định kỳ theo Thông tư 27 (Mức T: Hoàn thành tốt, H: Hoàn thành, C: Chưa hoàn thành)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveSubject("math")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubject === "math"
                  ? "bg-white text-[#6D28D9] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Môn Toán
            </button>
            <button
              onClick={() => setActiveSubject("vietnamese")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubject === "vietnamese"
                  ? "bg-white text-[#6D28D9] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Môn Tiếng Việt
            </button>
          </div>

          <button
            onClick={handleExport}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </button>

          <button
            onClick={handleSave}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-purple-900/10"
          >
            <Save className="w-3.5 h-3.5" /> Lưu điểm
          </button>
        </div>
      </div>

      {/* Subject Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-slate-400">Điểm trung bình môn</p>
          <p className="text-2xl font-bold text-[#6D28D9] mt-0.5">{stats.avg} / 10</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-emerald-700">Mức T (Tốt: 9 - 10)</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.excellent} HS</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-indigo-700">Mức H (Đạt: 7 - 8.5)</p>
          <p className="text-2xl font-bold text-indigo-700 mt-0.5">{stats.good} HS</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-amber-700">Cần rèn thêm (Dưới 7)</p>
          <p className="text-2xl font-bold text-amber-700 mt-0.5">{stats.average} HS</p>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-[24px] shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#6D28D9]"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Đang chấm: <strong className="text-[#6D28D9]">{activeSubject === "math" ? "Môn Toán" : "Môn Tiếng Việt"}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100 font-bold">
                <th className="py-3 px-4 text-center w-12">STT</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4 text-center">Tổ</th>
                <th className="py-3 px-4 text-center w-36">Điểm kiểm tra</th>
                <th className="py-3 px-4 text-center">Mức đạt (TT27)</th>
                <th className="py-3 px-4">Ghi chú nhận xét tiến độ</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filtered.map((s, idx) => {
                const score = activeSubject === "math" ? s.mathScore ?? 9 : s.vietnameseScore ?? 8.5;
                const level = score >= 9 ? "Hoàn thành tốt (T)" : score >= 6 ? "Hoàn thành (H)" : "Chưa hoàn thành (C)";

                return (
                  <tr key={s.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4 text-center text-xs text-slate-400 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 text-sm">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-semibold text-slate-600">
                      Tổ {s.group}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={score}
                          onChange={(e) =>
                            handleScoreChange(
                              s.id,
                              activeSubject === "math" ? "mathScore" : "vietnameseScore",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#6D28D9] outline-none"
                        />
                        <span className="text-xs text-slate-400">/10</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          score >= 9
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : score >= 6
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 italic truncate max-w-xs">
                      {s.notes || "Hoàn thành tốt các nội dung học tập."}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
