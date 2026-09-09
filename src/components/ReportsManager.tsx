import React from "react";
import { BarChart3, Download, Printer, Users, CheckCircle2, Award, BookOpen } from "lucide-react";
import * as XLSX from "xlsx";
import { Student, ClassInfo } from "../types.ts";

interface ReportsManagerProps {
  students: Student[];
  classInfo: ClassInfo;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  students,
  classInfo,
  showToast,
}) => {
  const stats = React.useMemo(() => {
    let present = 0;
    let goodStatus = 0;
    let needCare = 0;
    let totalStars = 0;
    let totalMath = 0;
    let totalVietnamese = 0;

    students.forEach((s) => {
      if (s.attendance === "Có mặt") present++;
      if (s.status === "Tốt" || s.status === "Tiến bộ") goodStatus++;
      if (s.status === "Cần quan tâm") needCare++;
      totalStars += s.stars || 0;
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
      avgStars: total > 0 ? Math.round(totalStars / total) : 0,
      avgMath: total > 0 ? (totalMath / total).toFixed(1) : "0",
      avgVietnamese: total > 0 ? (totalVietnamese / total).toFixed(1) : "0",
    };
  }, [students]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportComprehensiveExcel = () => {
    try {
      const data = students.map((s, idx) => ({
        STT: idx + 1,
        "Họ và tên": s.name,
        "Ngày sinh": s.dob,
        "Giới tính": s.gender,
        "Tổ": s.group,
        "SĐT Phụ huynh": s.parentPhone,
        "Chuyên cần": s.attendance,
        "Đánh giá hạnh kiểm": s.status,
        "Điểm Toán": s.mathScore || 0,
        "Điểm Tiếng Việt": s.vietnameseScore || 0,
        "Hoa điểm 10": s.stars || 0,
        "Nhận xét AI / Giáo viên": s.aiComment || s.notes || "Hoàn thành tốt.",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BaoCaoTongHop");
      XLSX.writeFile(wb, `Bao_cao_tong_hop_${classInfo.className}.xlsx`);
      showToast("Đã xuất báo cáo tổng hợp lớp thành file Excel!");
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
            Phiếu báo cáo toàn diện lớp {classInfo.className} • Năm học {classInfo.year}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> In báo cáo
          </button>
          <button
            onClick={handleExportComprehensiveExcel}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-purple-900/10"
          >
            <Download className="w-4 h-4" /> Xuất Excel Tổng Hợp
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white rounded-[24px] p-8 shadow-xs border border-slate-100 space-y-6">
        {/* Formal Header */}
        <div className="text-center border-b border-slate-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            {classInfo.school}
          </p>
          <h3 className="text-xl font-bold text-slate-800 mt-1 uppercase">
            BÁO CÁO TỔNG HỢP TÌNH HÌNH LỚP HỌC {classInfo.className}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Giáo viên chủ nhiệm:{" "}
            <strong className="text-slate-700">{classInfo.teacherName}</strong> • Sĩ số:{" "}
            <strong>{classInfo.totalStudents} học sinh</strong>
          </p>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
            <p className="text-xs font-semibold text-purple-700">Tỷ lệ chuyên cần</p>
            <p className="text-2xl font-black text-[#6D28D9] mt-1">
              {stats.presentRate}%
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
            <p className="text-xs font-semibold text-emerald-700">Học sinh Tốt/Tiến bộ</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {stats.goodStatusRate}%
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
            <p className="text-xs font-semibold text-indigo-700">Điểm TB Toán / Văn</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">
              {stats.avgMath} / {stats.avgVietnamese}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
            <p className="text-xs font-semibold text-amber-700">TB Sao thi đua</p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {stats.avgStars} sao
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
                {students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-bold text-slate-800">{s.name}</td>
                    <td className="p-2.5 text-center">Tổ {s.group}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          s.attendance === "Có mặt"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {s.attendance}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-800">
                      {s.mathScore || 9}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-800">
                      {s.vietnameseScore || 8.5}
                    </td>
                    <td className="p-2.5 text-center font-bold text-amber-600">
                      {s.stars || 0} ⭐
                    </td>
                    <td className="p-2.5 text-slate-600 italic truncate max-w-xs">
                      {s.aiComment || s.notes || "Hoàn thành tốt nhiệm vụ học tập."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Signature Line */}
        <div className="pt-6 flex justify-end">
          <div className="text-center w-56 space-y-12">
            <div>
              <p className="text-xs text-slate-500">
                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm{" "}
                {new Date().getFullYear()}
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
    </div>
  );
};
