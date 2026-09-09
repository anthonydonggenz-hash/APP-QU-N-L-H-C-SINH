import React, { useState } from "react";
import { CheckSquare, Plus, Calendar, CheckCircle2, Clock, X, Filter, Share2, Copy, Trash2, Users } from "lucide-react";
import { Student, ClassTask } from "../types.ts";

interface TasksManagerProps {
  students: Student[];
  tasks: ClassTask[];
  setTasks: React.Dispatch<React.SetStateAction<ClassTask[]>>;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const TasksManager: React.FC<TasksManagerProps> = ({
  students,
  tasks,
  setTasks,
  showToast,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number>(tasks[0]?.id || 1);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "incomplete" | "completed">("all");
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "Toán",
    dueDate: "Ngày mai",
  });

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const handleToggleStudent = (studentId: number) => {
    if (!currentTask) return;
    const isCompleted = currentTask.completedStudentIds.includes(studentId);
    const updatedIds = isCompleted
      ? currentTask.completedStudentIds.filter((id) => id !== studentId)
      : [...currentTask.completedStudentIds, studentId];

    setTasks(
      tasks.map((t) =>
        t.id === currentTask.id ? { ...t, completedStudentIds: updatedIds } : t
      )
    );
  };

  const handleMarkAll = (done: boolean) => {
    if (!currentTask) return;
    const updatedIds = done ? students.map((s) => s.id) : [];
    setTasks(
      tasks.map((t) => (t.id === currentTask.id ? { ...t, completedStudentIds: updatedIds } : t))
    );
    showToast(done ? "Đã đánh dấu hoàn thành cho tất cả học sinh" : "Đã đặt lại trạng thái bài tập");
  };

  const handleDeleteTask = (taskId: number) => {
    if (tasks.length <= 1) {
      showToast("Cần giữ lại ít nhất 1 nhiệm vụ trong danh sách", "warning");
      return;
    }
    const filtered = tasks.filter((t) => t.id !== taskId);
    setTasks(filtered);
    setSelectedTaskId(filtered[0]?.id || 1);
    showToast("Đã xóa nhiệm vụ!");
  };

  const handleCopyIncompleteNotice = () => {
    if (!currentTask) return;
    const incompleteStudents = students.filter(
      (s) => !currentTask.completedStudentIds.includes(s.id)
    );
    if (incompleteStudents.length === 0) {
      showToast("Tất cả học sinh đều đã hoàn thành bài tập này!");
      return;
    }

    const text = `📢 NHẮC NHỞ BÀI TẬP VỀ NHÀ: ${currentTask.title} (${currentTask.subject})\n📅 Hạn nộp: ${currentTask.dueDate}\n⚠️ Các con hiện chưa nộp bài (${incompleteStudents.length} bạn):\n${incompleteStudents.map((s, i) => `${i + 1}. ${s.name} (Tổ ${s.group})`).join("\n")}\n\nKính nhờ quý phụ huynh kiểm tra góc học tập và đôn đốc các con hoàn thành trước hạn nộp. Trân trọng cảm ơn!`;
    navigator.clipboard.writeText(text);
    showToast("Đã sao chép tin nhắc nhở các em chưa nộp bài vào clipboard!");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      showToast("Vui lòng nhập tên nhiệm vụ", "warning");
      return;
    }

    const created: ClassTask = {
      id: Date.now(),
      title: newTask.title,
      subject: newTask.subject,
      dueDate: newTask.dueDate,
      completedStudentIds: [],
    };

    setTasks([created, ...tasks]);
    setSelectedTaskId(created.id);
    setShowAddTaskModal(false);
    setNewTask({ title: "", subject: "Toán", dueDate: "Ngày mai" });
    showToast("Đã giao nhiệm vụ mới cho lớp!");
  };

  const completedCount = currentTask?.completedStudentIds?.length || 0;
  const completionRate =
    students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0;

  const filteredStudents = students.filter((s) => {
    if (!currentTask) return true;
    const isDone = currentTask.completedStudentIds.includes(s.id);
    if (filterMode === "incomplete") return !isDone;
    if (filterMode === "completed") return isDone;
    return true;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-[#6D28D9]" /> Nhiệm Vụ & Bài Tập Về Nhà
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Giao bài tập, phân công nhật ký trực nhật và theo dõi tiến độ nộp bài của học sinh
          </p>
        </div>

        <button
          onClick={() => setShowAddTaskModal(true)}
          className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-purple-900/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Giao nhiệm vụ mới
        </button>
      </div>

      {/* Task List Horizontal Pills */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar">
        {tasks.map((task) => {
          const isSelected = task.id === selectedTaskId;
          const done = task.completedStudentIds.length;
          return (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`px-4 py-3 rounded-2xl text-left flex-shrink-0 transition-all border cursor-pointer ${
                isSelected
                  ? "bg-white border-[#6D28D9] shadow-md shadow-purple-900/5 ring-2 ring-[#6D28D9]/30"
                  : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-[#6D28D9]">
                  {task.subject}
                </span>
                <span className="text-[10px] text-slate-400">{task.dueDate}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 max-w-[200px] truncate">
                {task.title}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {done}/{students.length} đã hoàn thành
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Task Details & Student Checklist */}
      {currentTask && (
        <div className="bg-white rounded-[24px] p-6 shadow-xs border border-slate-100 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6D28D9]">
                  {currentTask.subject}
                </span>
                <span className="text-xs text-slate-500">Hạn: {currentTask.dueDate}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-1 flex items-center gap-2">
                <span>{currentTask.title}</span>
                <button
                  onClick={() => handleDeleteTask(currentTask.id)}
                  className="text-slate-300 hover:text-rose-600 transition p-1 cursor-pointer"
                  title="Xóa nhiệm vụ này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:w-56 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Tiến độ nộp</span>
                  <span className="text-[#6D28D9]">{completedCount}/{students.length} ({completionRate}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${completionRate}%` }}
                    className="bg-gradient-to-r from-[#623CEB] to-emerald-500 h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleCopyIncompleteNotice}
                  className="px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                  title="Sao chép danh sách các em chưa nộp để gửi Zalo"
                >
                  <Share2 className="w-3.5 h-3.5" /> Nhắc Zalo PH
                </button>
                <button
                  onClick={() => handleMarkAll(true)}
                  className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition border border-emerald-200 cursor-pointer"
                >
                  Nộp cả lớp
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Lọc:</span>
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === "all"
                    ? "bg-[#6D28D9] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tất cả ({students.length})
              </button>
              <button
                onClick={() => setFilterMode("incomplete")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === "incomplete"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Chưa nộp ({students.length - completedCount})
              </button>
              <button
                onClick={() => setFilterMode("completed")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === "completed"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Đã nộp ({completedCount})
              </button>
            </div>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1 hide-scrollbar">
            {filteredStudents.map((student) => {
              const isDone = currentTask.completedStudentIds.includes(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStudent(student.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isDone
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                      : "bg-slate-50/50 border-slate-100 hover:bg-purple-50/30 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                        student.gender === "Nam" ? "bg-[#6D28D9]" : "bg-pink-500"
                      }`}
                    >
                      {student.name.charAt(student.name.lastIndexOf(" ") + 1)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{student.name}</p>
                      <p className="text-[10px] text-slate-400">Tổ {student.group} • {isDone ? "Đã nộp bài" : "Chưa nộp"}</p>
                    </div>
                  </div>

                  <button
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">Giao nhiệm vụ mới</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nội dung nhiệm vụ / bài tập *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                  placeholder="Ví dụ: Ôn tập bảng nhân 7 trang 30 SGK"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Môn học
                  </label>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm cursor-pointer"
                  >
                    <option value="Toán">Toán</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Trực nhật / Hoạt động">Trực nhật / Hoạt động</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hạn nộp / Thời gian
                  </label>
                  <input
                    type="text"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D28D9] outline-none text-sm"
                    placeholder="Ngày mai / Thứ Sáu"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  Giao bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
