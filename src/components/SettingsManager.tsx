import React, { useState } from "react";
import { Settings, Save, RotateCcw, Download, School, User, Calendar } from "lucide-react";
import { ClassInfo, Student } from "../types.ts";
import { DEFAULT_CLASS_INFO, INITIAL_STUDENTS } from "../data/initialData.ts";

interface SettingsManagerProps {
  classInfo: ClassInfo;
  setClassInfo: React.Dispatch<React.SetStateAction<ClassInfo>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  classInfo,
  setClassInfo,
  setStudents,
  showToast,
}) => {
  const [formData, setFormData] = useState<ClassInfo>({ ...classInfo });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setClassInfo(formData);
    showToast("Đã lưu thiết lập thông tin lớp học thành công!");
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu?")) {
      setClassInfo(DEFAULT_CLASS_INFO);
      setStudents(INITIAL_STUDENTS);
      setFormData(DEFAULT_CLASS_INFO);
      localStorage.removeItem("classInfo");
      localStorage.removeItem("students");
      showToast("Đã khôi phục dữ liệu demo ban đầu!");
    }
  };

  const handleExportBackup = () => {
    const backup = {
      classInfo,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${classInfo.className}.json`;
    a.click();
    showToast("Đã xuất file sao lưu dữ liệu!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#6D28D9]" /> Cài Đặt Thông Tin Lớp Học
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh thông tin trường học, niên khóa, tên giáo viên và lớp chủ nhiệm
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 space-y-5">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <School className="w-4 h-4 text-[#6D28D9]" /> Thông tin chung
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tên Trường học *
            </label>
            <input
              type="text"
              required
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Niên khóa / Năm học *
            </label>
            <input
              type="text"
              required
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Khối lớp
            </label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tên Lớp chủ nhiệm *
            </label>
            <input
              type="text"
              required
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm font-bold text-[#6D28D9]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Phòng học
            </label>
            <input
              type="text"
              value={formData.room || ""}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Họ và tên Giáo viên chủ nhiệm *
          </label>
          <input
            type="text"
            required
            value={formData.teacherName}
            onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm font-bold"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Dữ liệu mẫu ban đầu
            </button>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Tải file JSON
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/10 transition"
          >
            <Save className="w-4 h-4" /> Lưu cấu hình
          </button>
        </div>
      </form>
    </div>
  );
};
