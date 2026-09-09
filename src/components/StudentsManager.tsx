import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Phone,
  Edit2,
  Trash2,
  X,
  Eye,
  Star,
  BookOpen,
  Sparkles,
  MessageSquareText,
  CheckCircle2,
  Award,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Student } from "../types.ts";

interface StudentsManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  initialFilterStatus?: string;
  initialStudentId?: number | null;
  isOpenExcelImport?: boolean;
  onNavigateToAI?: (studentId: number) => void;
  onNavigateToParent?: (studentId: number) => void;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  setStudents,
  initialFilterStatus,
  initialStudentId,
  isOpenExcelImport,
  onNavigateToAI,
  onNavigateToParent,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus || "all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial props
  useEffect(() => {
    if (initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
    }
  }, [initialFilterStatus]);

  useEffect(() => {
    if (initialStudentId) {
      const found = students.find((s) => s.id === initialStudentId);
      if (found) {
        setSelectedStudentForView(found);
      }
    }
  }, [initialStudentId, students]);

  useEffect(() => {
    if (isOpenExcelImport && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isOpenExcelImport]);

  const [newStudent, setNewStudent] = useState({
    name: "",
    dob: "",
    gender: "Nam" as "Nam" | "Nữ",
    group: "1",
    parentPhone: "",
    parentName: "",
    notes: "",
    status: "Tốt" as Student["status"],
  });

  // Handle Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) {
      showToast("Vui lòng nhập họ và tên học sinh", "warning");
      return;
    }

    const student: Student = {
      id: Date.now(),
      name: newStudent.name.trim(),
      dob: newStudent.dob.trim() || "01/01/2018",
      gender: newStudent.gender,
      group: parseInt(newStudent.group) || 1,
      parentPhone: newStudent.parentPhone.trim(),
      parentName: newStudent.parentName.trim() || "Phụ huynh",
      attendance: "Có mặt",
      status: newStudent.status,
      taskDone: 5,
      taskTotal: 5,
      stars: 10,
      mathScore: 9,
      vietnameseScore: 8.5,
      notes: newStudent.notes.trim(),
    };

    setStudents([student, ...students]);
    setShowAddModal(false);
    setNewStudent({
      name: "",
      dob: "",
      gender: "Nam",
      group: "1",
      parentPhone: "",
      parentName: "",
      notes: "",
      status: "Tốt",
    });
    showToast(`Đã thêm học sinh ${student.name} thành công!`);
  };

  // Handle Edit Student
  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;

    setStudents(
      students.map((s) =>
        s.id === selectedStudentForEdit.id ? selectedStudentForEdit : s
      )
    );
    showToast(`Đã cập nhật thông tin em ${selectedStudentForEdit.name}!`);
    setSelectedStudentForEdit(null);
  };

  // Handle Delete
  const confirmDelete = () => {
    if (!studentToDelete) return;
    setStudents(students.filter((s) => s.id !== studentToDelete.id));
    showToast(`Đã xóa học sinh ${studentToDelete.name}`, "info");
    setStudentToDelete(null);
  };

  // Excel File Upload & Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (data.length === 0) {
          showToast("File Excel trống hoặc không có dữ liệu", "warning");
          return;
        }

        const imported: Student[] = data.map((row, index) => {
          const name =
            row["Họ và tên"] ||
            row["Họ và Tên"] ||
            row["Họ Tên"] ||
            row["Name"] ||
            row["Tên"] ||
            "Học sinh mới";

          const dob =
            row["Ngày sinh"] ||
            row["Ngày Sinh"] ||
            row["DOB"] ||
            row["dob"] ||
            "";

          const rawGender = (
            row["Giới tính"] ||
            row["Giới Tính"] ||
            row["Gender"] ||
            "Nam"
          ).toString();
          const gender: "Nam" | "Nữ" =
            rawGender.toLowerCase().includes("nữ") ||
            rawGender.toLowerCase().includes("female")
              ? "Nữ"
              : "Nam";

          const groupRaw = parseInt(
            row["Tổ"] || row["Group"] || row["Nhóm"] || 1
          );
          const group = isNaN(groupRaw) ? 1 : Math.max(1, Math.min(4, groupRaw));

          const parentPhone = (
            row["SĐT Phụ huynh"] ||
            row["SĐT"] ||
            row["Số điện thoại"] ||
            row["Phone"] ||
            ""
          ).toString();

          const parentName =
            row["Tên Phụ huynh"] || row["Phụ huynh"] || row["Parent"] || "";

          return {
            id: Date.now() + index,
            name,
            dob: String(dob),
            gender,
            group,
            parentPhone,
            parentName,
            attendance: "Có mặt",
            status: "Tốt",
            taskDone: 5,
            taskTotal: 5,
            stars: 10,
            mathScore: 9,
            vietnameseScore: 8.5,
          };
        });

        setStudents([...students, ...imported]);
        showToast(`Đã nhập thành công ${imported.length} học sinh từ file Excel!`);
      } catch (err) {
        console.error("Lỗi nhập Excel:", err);
        showToast("Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.", "error");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsBinaryString(file);
  };

  // Excel Export
  const handleExportExcel = () => {
    try {
      const exportData = students.map((s, idx) => ({
        STT: idx + 1,
        "Họ và tên": s.name,
        "Ngày sinh": s.dob,
        "Giới tính": s.gender,
        "Tổ": s.group,
        "SĐT Phụ huynh": s.parentPhone,
        "Họ tên Phụ huynh": s.parentName || "",
        "Trạng thái": s.status,
        "Điểm Toán": s.mathScore ?? "",
        "Điểm Tiếng Việt": s.vietnameseScore ?? "",
        "Điểm sao thi đua": s.stars,
        "Ghi chú giáo viên": s.notes || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHocSinh");
      XLSX.writeFile(workbook, "Danh_sach_hoc_sinh_Lop3A1.xlsx");
      showToast("Đã xuất danh sách lớp thành file Excel!");
    } catch (err) {
      console.error(err);
      showToast("Không thể xuất file Excel", "error");
    }
  };

  // Sample Template Download
  const handleDownloadSampleTemplate = () => {
    const sample = [
      {
        "Họ và tên": "Nguyễn Văn An",
        "Ngày sinh": "15/03/2018",
        "Giới tính": "Nam",
        "Tổ": 1,
        "SĐT Phụ huynh": "0987654321",
        "Tên Phụ huynh": "Nguyễn Văn Hùng",
      },
      {
        "Họ và tên": "Trần Thị Mai",
        "Ngày sinh": "20/08/2018",
        "Giới tính": "Nữ",
        "Tổ": 2,
        "SĐT Phụ huynh": "0912345678",
        "Tên Phụ huynh": "Trần Thị Lan",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MauNhapHocSinh");
    XLSX.writeFile(wb, "Mau_Nhap_Hoc_Sinh_Lop.xlsx");
    showToast("Đã tải về file mẫu Excel!");
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);
    const matchGroup = filterGroup === "all" || s.group.toString() === filterGroup;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchGroup && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Danh sách học sinh
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng số: <span className="font-bold text-[#1c2e4a]">{students.length} học sinh</span> • Phân chia 4 tổ
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            id="btn-download-sample-excel"
            onClick={handleDownloadSampleTemplate}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Tải file mẫu để điền"
          >
            <Download className="w-3.5 h-3.5" /> File mẫu
          </button>

          <button
            id="btn-upload-excel"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Nhập Excel
          </button>

          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1c2e4a]" /> Xuất Excel
          </button>

          <button
            id="btn-add-student-modal"
            onClick={() => setShowAddModal(true)}
            className="bg-[#1c2e4a] hover:bg-[#152238] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm học sinh
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-[20px] p-4 shadow-xs border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="search-students-input"
            type="text"
            placeholder="Tìm kiếm theo tên hoặc SĐT phụ huynh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs focus:ring-2 focus:ring-[#1c2e4a] outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Tổ filter */}
          <select
            id="filter-group-select"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1c2e4a] cursor-pointer"
          >
            <option value="all">Tất cả các tổ</option>
            <option value="1">Tổ 1</option>
            <option value="2">Tổ 2</option>
            <option value="3">Tổ 3</option>
            <option value="4">Tổ 4</option>
          </select>

          {/* Trạng thái filter */}
          <select
            id="filter-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1c2e4a] cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Tốt">Tốt</option>
            <option value="Tiến bộ">Tiến bộ</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Cần quan tâm">Cần quan tâm</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-[24px] shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100 font-bold">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Ngày sinh</th>
                <th className="py-3.5 px-4 text-center">Tổ</th>
                <th className="py-3.5 px-4 hidden md:table-cell">SĐT Phụ huynh</th>
                <th className="py-3.5 px-4 text-center">Thi đua</th>
                <th className="py-3.5 px-4 text-center">Đánh giá</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredStudents.map((s, index) => (
                <tr
                  key={s.id}
                  className="hover:bg-[#23395d]/5 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400">
                    {index + 1}
                  </td>

                  {/* Student Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                          s.gender === "Nam"
                            ? "bg-gradient-to-tr from-[#623CEB] to-[#8B5CF6]"
                            : "bg-gradient-to-tr from-pink-500 to-rose-400"
                        }`}
                      >
                        {s.name.trim().charAt(s.name.trim().lastIndexOf(" ") + 1) || "A"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm group-hover:text-[#6D28D9] transition-colors">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-400 sm:hidden">
                          {s.dob} • Tổ {s.group}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* DoB */}
                  <td className="py-3.5 px-4 text-xs text-slate-600 hidden sm:table-cell">
                    {s.dob}
                  </td>

                  {/* Tổ */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                      {s.group}
                    </span>
                  </td>

                  {/* Parent Phone */}
                  <td className="py-3.5 px-4 text-xs hidden md:table-cell">
                    {s.parentPhone ? (
                      <a
                        href={`tel:${s.parentPhone}`}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#6D28D9] transition font-medium"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {s.parentPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Chưa cập nhật</span>
                    )}
                  </td>

                  {/* Stars / Thi đua */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {s.stars || 0}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        s.status === "Tốt"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : s.status === "Tiến bộ"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : s.status === "Cần quan tâm"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onNavigateToAI && (
                        <button
                          onClick={() => onNavigateToAI(s.id)}
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition"
                          title="Mở AI tạo nhận xét học bạ"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                      {onNavigateToParent && (
                        <button
                          onClick={() => onNavigateToParent(s.id)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                          title="Nhắn tin cho phụ huynh"
                        >
                          <MessageSquareText className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedStudentForView(s)}
                        className="p-1.5 text-slate-400 hover:text-[#6D28D9] hover:bg-purple-50 rounded-lg transition"
                        title="Xem hồ sơ học sinh 360°"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedStudentForEdit({ ...s })}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentToDelete(s)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thêm Học Sinh */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                Thêm học sinh mới vào lớp
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="text"
                    value={newStudent.dob}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, dob: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                    placeholder="12/05/2018"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Giới tính
                  </label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        gender: e.target.value as "Nam" | "Nữ",
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tổ
                  </label>
                  <select
                    value={newStudent.group}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, group: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm cursor-pointer"
                  >
                    <option value="1">Tổ 1</option>
                    <option value="2">Tổ 2</option>
                    <option value="3">Tổ 3</option>
                    <option value="4">Tổ 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Trạng thái ban đầu
                  </label>
                  <select
                    value={newStudent.status}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        status: e.target.value as Student["status"],
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm cursor-pointer"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Tiến bộ">Tiến bộ</option>
                    <option value="Bình thường">Bình thường</option>
                    <option value="Cần quan tâm">Cần quan tâm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SĐT Phụ huynh
                  </label>
                  <input
                    type="text"
                    value={newStudent.parentPhone}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, parentPhone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Họ tên Phụ huynh
                  </label>
                  <input
                    type="text"
                    value={newStudent.parentName}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, parentName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                    placeholder="Nguyễn Văn Hùng"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú về học sinh
                </label>
                <textarea
                  rows={2}
                  value={newStudent.notes}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm resize-none"
                  placeholder="Đặc điểm tính cách, năng khiếu hoặc vấn đề sức khỏe..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl text-sm font-semibold transition shadow-md"
                >
                  Thêm học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem Hồ Sơ Học Sinh 360° Toàn Diện */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[#623CEB] via-[#7C3AED] to-[#8B5CF6] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#6D28D9] font-black flex items-center justify-center text-xl shadow-lg border-2 border-white/40">
                  {selectedStudentForView.name.charAt(
                    selectedStudentForView.name.lastIndexOf(" ") + 1
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl leading-tight">
                    {selectedStudentForView.name}
                  </h3>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Tổ {selectedStudentForView.group} • {selectedStudentForView.gender} • Ngày sinh: {selectedStudentForView.dob}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                      Chuyên cần: {selectedStudentForView.attendance}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-400/30 text-white">
                      Trạng thái: {selectedStudentForView.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Thi đua & Tặng sao nhanh */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900 uppercase">Hoa điểm 10 & Thi đua</p>
                  <p className="text-2xl font-black text-amber-600 mt-0.5 flex items-center gap-1.5">
                    ⭐ {selectedStudentForView.stars || 0} <span className="text-xs font-bold text-slate-600">sao tích lũy</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const id = selectedStudentForView.id;
                      setStudents((prev) =>
                        prev.map((st) => (st.id === id ? { ...st, stars: Math.max(0, (st.stars || 0) - 1) } : st))
                      );
                      setSelectedStudentForView((prev) =>
                        prev ? { ...prev, stars: Math.max(0, (prev.stars || 0) - 1) } : null
                      );
                    }}
                    className="w-8 h-8 rounded-xl bg-white border border-amber-200 text-slate-600 hover:bg-amber-100 font-bold text-sm transition flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Trừ 1 sao"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => {
                      const id = selectedStudentForView.id;
                      setStudents((prev) =>
                        prev.map((st) => (st.id === id ? { ...st, stars: (st.stars || 0) + 1 } : st))
                      );
                      setSelectedStudentForView((prev) =>
                        prev ? { ...prev, stars: (prev.stars || 0) + 1 } : null
                      );
                      showToast(`Đã tặng 1 sao cho em ${selectedStudentForView.name}!`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Thưởng 1 sao"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" /> +1 Sao
                  </button>
                  <button
                    onClick={() => {
                      const id = selectedStudentForView.id;
                      setStudents((prev) =>
                        prev.map((st) => (st.id === id ? { ...st, stars: (st.stars || 0) + 2 } : st))
                      );
                      setSelectedStudentForView((prev) =>
                        prev ? { ...prev, stars: (prev.stars || 0) + 2 } : null
                      );
                      showToast(`Đã thưởng nóng 2 sao cho em ${selectedStudentForView.name}!`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    title="Thưởng nóng 2 sao"
                  >
                    +2 Sao
                  </button>
                </div>
              </div>

              {/* Học tập & Xếp loại Thông tư 27 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700 uppercase">
                    Kết quả học tập & Đánh giá TT27
                  </p>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      (selectedStudentForView.mathScore || 8) >= 9 && (selectedStudentForView.vietnameseScore || 8) >= 9
                        ? "bg-emerald-100 text-emerald-800"
                        : (selectedStudentForView.mathScore || 8) >= 7
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {(selectedStudentForView.mathScore || 8) >= 9 && (selectedStudentForView.vietnameseScore || 8) >= 9
                      ? "Mức T (Hoàn thành tốt)"
                      : (selectedStudentForView.mathScore || 8) >= 7
                      ? "Mức H (Hoàn thành)"
                      : "Mức C (Chưa hoàn thành)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <p className="text-[11px] text-slate-500 font-semibold">Điểm Toán</p>
                    <p className="text-xl font-extrabold text-[#6D28D9] mt-0.5">
                      {selectedStudentForView.mathScore ?? "--"} <span className="text-xs font-medium text-slate-400">/ 10</span>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <p className="text-[11px] text-slate-500 font-semibold">Điểm Tiếng Việt</p>
                    <p className="text-xl font-extrabold text-indigo-600 mt-0.5">
                      {selectedStudentForView.vietnameseScore ?? "--"} <span className="text-xs font-medium text-slate-400">/ 10</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Lời nhận xét học bạ Thông tư 27 */}
              <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#6D28D9] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Lời nhận xét học bạ (AI / GVCN)
                  </p>
                  {onNavigateToAI && (
                    <button
                      onClick={() => {
                        const sId = selectedStudentForView.id;
                        setSelectedStudentForView(null);
                        onNavigateToAI(sId);
                      }}
                      className="text-xs font-bold text-[#6D28D9] hover:underline cursor-pointer"
                    >
                      {selectedStudentForView.aiComment ? "Sửa bằng AI &rarr;" : "Tạo bằng AI &rarr;"}
                    </button>
                  )}
                </div>

                {selectedStudentForView.aiComment ? (
                  <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-purple-100 leading-relaxed font-medium">
                    "{selectedStudentForView.aiComment}"
                  </p>
                ) : (
                  <div className="text-xs text-slate-500 italic bg-white/80 p-3 rounded-xl border border-dashed border-purple-200 text-center">
                    Học sinh này chưa có nhận xét học bạ được lưu.
                  </div>
                )}
              </div>

              {/* Thông tin phụ huynh & Liên lạc */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <p className="font-bold text-slate-700 uppercase mb-1">
                  Liên hệ Phụ huynh
                </p>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Họ tên PH:</span>
                  <span className="font-bold text-slate-800">
                    {selectedStudentForView.parentName || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Số điện thoại:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedStudentForView.parentPhone}`}
                      className="font-bold text-[#6D28D9] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {selectedStudentForView.parentPhone || "Chưa cập nhật"}
                    </a>
                  </div>
                </div>

                {onNavigateToParent && (
                  <button
                    onClick={() => {
                      const sId = selectedStudentForView.id;
                      setSelectedStudentForView(null);
                      onNavigateToParent(sId);
                    }}
                    className="w-full mt-2 py-2 bg-purple-100 hover:bg-purple-200 text-[#6D28D9] rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquareText className="w-4 h-4" /> Nhắn tin cho phụ huynh học sinh này
                  </button>
                )}
              </div>

              {/* Ghi chú */}
              {selectedStudentForView.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase mb-1">
                    Ghi chú của Thầy/Cô
                  </p>
                  <p className="text-xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed italic">
                    {selectedStudentForView.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh Sửa Học Sinh */}
      {selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                Chỉnh sửa thông tin học sinh
              </h3>
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={selectedStudentForEdit.name}
                  onChange={(e) =>
                    setSelectedStudentForEdit({
                      ...selectedStudentForEdit,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="text"
                    value={selectedStudentForEdit.dob}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        dob: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Giới tính
                  </label>
                  <select
                    value={selectedStudentForEdit.gender}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        gender: e.target.value as "Nam" | "Nữ",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tổ
                  </label>
                  <select
                    value={selectedStudentForEdit.group}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        group: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm cursor-pointer"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Đánh giá
                  </label>
                  <select
                    value={selectedStudentForEdit.status}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        status: e.target.value as Student["status"],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm cursor-pointer"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Tiến bộ">Tiến bộ</option>
                    <option value="Bình thường">Bình thường</option>
                    <option value="Cần quan tâm">Cần quan tâm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SĐT Phụ huynh
                  </label>
                  <input
                    type="text"
                    value={selectedStudentForEdit.parentPhone}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        parentPhone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Họ tên Phụ huynh
                  </label>
                  <input
                    type="text"
                    value={selectedStudentForEdit.parentName || ""}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        parentName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Điểm Toán
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={selectedStudentForEdit.mathScore ?? 9}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        mathScore: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Điểm Tiếng Việt
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={selectedStudentForEdit.vietnameseScore ?? 9}
                    onChange={(e) =>
                      setSelectedStudentForEdit({
                        ...selectedStudentForEdit,
                        vietnameseScore: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={selectedStudentForEdit.notes || ""}
                  onChange={(e) =>
                    setSelectedStudentForEdit({
                      ...selectedStudentForEdit,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForEdit(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl text-sm font-semibold transition shadow-md"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Xác nhận xóa học sinh?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa học sinh{" "}
                <span className="font-bold text-slate-800">
                  {studentToDelete.name}
                </span>{" "}
                khỏi danh sách lớp?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-xs font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-semibold transition shadow-md"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
