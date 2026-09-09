export interface Student {
  id: number;
  name: string;
  dob: string;
  gender: "Nam" | "Nữ";
  group: number; // 1, 2, 3, 4
  parentPhone: string;
  parentName?: string;
  address?: string;
  attendance: "Có mặt" | "Vắng phép" | "Vắng không phép" | "Đi muộn";
  status: "Tốt" | "Tiến bộ" | "Bình thường" | "Cần quan tâm";
  taskDone: number;
  taskTotal: number;
  stars: number; // Điểm thi đua / hoa điểm 10
  notes?: string;
  mathScore?: number;
  vietnameseScore?: number;
  aiComment?: string;
}

export interface ClassInfo {
  school: string;
  year: string;
  grade: string;
  className: string;
  teacherName: string;
  totalStudents: number;
  room?: string;
}

export interface ClassEvent {
  id: number;
  title: string;
  date: string;
  dayText: string;
  time: string;
  location: string;
  type: "meeting" | "activity" | "exam" | "other";
}

export interface ClassTask {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  completedStudentIds: number[];
}

export interface BehaviorRecord {
  id: number;
  studentId: number;
  studentName: string;
  group: number;
  type: "positive" | "negative";
  points: number;
  reason: string;
  time: string;
}
