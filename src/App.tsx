/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, ClassInfo, ClassEvent, ClassTask } from "./types.ts";
import {
  INITIAL_STUDENTS,
  DEFAULT_CLASS_INFO,
  INITIAL_EVENTS,
  INITIAL_TASKS,
} from "./data/initialData.ts";
import { Sidebar } from "./components/Sidebar.tsx";
import { Topbar } from "./components/Topbar.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { StudentsManager } from "./components/StudentsManager.tsx";
import { AttendanceManager } from "./components/AttendanceManager.tsx";
import { AICommentManager } from "./components/AICommentManager.tsx";
import { LearningManager } from "./components/LearningManager.tsx";
import { BehaviorManager } from "./components/BehaviorManager.tsx";
import { TasksManager } from "./components/TasksManager.tsx";
import { ParentsManager } from "./components/ParentsManager.tsx";
import { ReportsManager } from "./components/ReportsManager.tsx";
import { SettingsManager } from "./components/SettingsManager.tsx";
import { Login } from "./components/Login.tsx";
import { Toast, ToastState } from "./components/Toast.tsx";

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("thaydong_logged_in");
    return saved !== null ? saved === "true" : true;
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Core Data States with LocalStorage Persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem("thaydong_students");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  });

  const [classInfo, setClassInfo] = useState<ClassInfo>(() => {
    try {
      const saved = localStorage.getItem("thaydong_classInfo");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.teacherName === "Trẩn Đông - AI Trainer" ||
          parsed.teacherName === "Trần Đông - AI Trainer" ||
          !parsed.teacherName
        ) {
          parsed.teacherName = "Thầy Trần Đông - AI Trainer";
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CLASS_INFO;
  });

  const [events, setEvents] = useState<ClassEvent[]>(() => {
    try {
      const saved = localStorage.getItem("thaydong_events");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EVENTS;
  });

  const [tasks, setTasks] = useState<ClassTask[]>(() => {
    try {
      const saved = localStorage.getItem("thaydong_tasks");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TASKS;
  });

  // Toast Notification State
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Cross-module linking state
  const [targetStudentForAI, setTargetStudentForAI] = useState<number | null>(null);
  const [targetStudentForParent, setTargetStudentForParent] = useState<number | null>(null);
  const [targetStudentForBehavior, setTargetStudentForBehavior] = useState<number | null>(null);
  const [targetStudentForProfile, setTargetStudentForProfile] = useState<number | null>(null);
  const [studentInitialFilter, setStudentInitialFilter] = useState<string>("all");
  const [openExcelInStudents, setOpenExcelInStudents] = useState<boolean>(false);

  const handleNavigate = (
    tab: string,
    options?: { studentId?: number; filter?: string; openExcel?: boolean }
  ) => {
    if (options?.studentId) {
      if (tab === "ai_comment") setTargetStudentForAI(options.studentId);
      if (tab === "parents") setTargetStudentForParent(options.studentId);
      if (tab === "behavior") setTargetStudentForBehavior(options.studentId);
      if (tab === "students") setTargetStudentForProfile(options.studentId);
    }
    if (options?.filter && tab === "students") {
      setStudentInitialFilter(options.filter);
    }
    if (options?.openExcel && tab === "students") {
      setOpenExcelInStudents(true);
    }
    setActiveTab(tab);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Sync total students count with students array length
  useEffect(() => {
    setClassInfo((prev) => {
      if (prev.totalStudents !== students.length) {
        return { ...prev, totalStudents: students.length };
      }
      return prev;
    });
  }, [students.length]);

  // Persist states
  useEffect(() => {
    localStorage.setItem("thaydong_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("thaydong_classInfo", JSON.stringify(classInfo));
  }, [classInfo]);

  useEffect(() => {
    localStorage.setItem("thaydong_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("thaydong_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("thaydong_logged_in", isLoggedIn.toString());
  }, [isLoggedIn]);

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast("Đã đăng xuất khỏi tài khoản giáo viên", "info");
  };

  const handleLogin = (name: string) => {
    setIsLoggedIn(true);
    showToast(`Chào mừng ${name} trở lại với lớp học!`);
  };

  // If logged out, render Login screen
  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast toast={toast} onClose={closeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col lg:flex-row font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        classInfo={classInfo}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <Topbar
          classInfo={classInfo}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onQuickAttendance={() => setActiveTab("attendance")}
          onQuickAI={() => setActiveTab("ai_comment")}
        />

        {/* Tab Routing */}
        <main className="flex-1 p-4 md:p-8">
          {activeTab === "dashboard" && (
            <Dashboard
              students={students}
              classInfo={classInfo}
              events={events}
              setEvents={setEvents}
              tasks={tasks}
              onNavigate={handleNavigate}
              onOpenExcelImport={() => handleNavigate("students", { openExcel: true })}
              showToast={showToast}
            />
          )}

          {activeTab === "students" && (
            <StudentsManager
              students={students}
              setStudents={setStudents}
              initialFilterStatus={studentInitialFilter}
              initialStudentId={targetStudentForProfile}
              isOpenExcelImport={openExcelInStudents}
              onNavigateToAI={(id) => handleNavigate("ai_comment", { studentId: id })}
              onNavigateToParent={(id) => handleNavigate("parents", { studentId: id })}
              showToast={showToast}
            />
          )}

          {activeTab === "attendance" && (
            <AttendanceManager
              students={students}
              setStudents={setStudents}
              classInfo={classInfo}
              onNavigateToParent={(id) => handleNavigate("parents", { studentId: id })}
              showToast={showToast}
            />
          )}

          {activeTab === "ai_comment" && (
            <AICommentManager
              students={students}
              setStudents={setStudents}
              targetStudentId={targetStudentForAI}
              onNavigateToParent={(id) => handleNavigate("parents", { studentId: id })}
              showToast={showToast}
            />
          )}

          {activeTab === "learning" && (
            <LearningManager
              students={students}
              setStudents={setStudents}
              showToast={showToast}
            />
          )}

          {activeTab === "behavior" && (
            <BehaviorManager
              students={students}
              setStudents={setStudents}
              initialStudentId={targetStudentForBehavior}
              onNavigateToParent={(id) => handleNavigate("parents", { studentId: id })}
              showToast={showToast}
            />
          )}

          {activeTab === "tasks" && (
            <TasksManager
              students={students}
              tasks={tasks}
              setTasks={setTasks}
              showToast={showToast}
            />
          )}

          {activeTab === "parents" && (
            <ParentsManager
              students={students}
              classInfo={classInfo}
              initialStudentId={targetStudentForParent}
              showToast={showToast}
            />
          )}

          {activeTab === "reports" && (
            <ReportsManager
              students={students}
              classInfo={classInfo}
              showToast={showToast}
            />
          )}

          {activeTab === "settings" && (
            <SettingsManager
              classInfo={classInfo}
              setClassInfo={setClassInfo}
              setStudents={setStudents}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notification System */}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

