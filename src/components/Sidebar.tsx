import React from "react";
import {
  LayoutGrid,
  Users,
  CalendarCheck,
  Wand2,
  BookOpen,
  Award,
  CheckSquare,
  MessageSquareText,
  BarChart3,
  Settings,
  GraduationCap,
  LogOut,
  X,
} from "lucide-react";
import { ClassInfo } from "../types.ts";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  classInfo: ClassInfo;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  classInfo,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const menuItems = [
    { id: "dashboard", icon: LayoutGrid, label: "Tổng quan" },
    { id: "students", icon: Users, label: "Học sinh" },
    { id: "attendance", icon: CalendarCheck, label: "Điểm danh" },
    { id: "ai_comment", icon: Wand2, label: "AI Nhận xét", highlight: true },
    { id: "learning", icon: BookOpen, label: "Học tập" },
    { id: "behavior", icon: Award, label: "Thi đua" },
    { id: "tasks", icon: CheckSquare, label: "Nhiệm vụ" },
    { id: "parents", icon: MessageSquareText, label: "Phụ huynh" },
    { id: "reports", icon: BarChart3, label: "Báo cáo" },
    { id: "settings", icon: Settings, label: "Cài đặt" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#1c2e4a] via-[#192841] to-[#152238] text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } rounded-r-[28px] lg:rounded-l-[28px] lg:rounded-r-none border-r border-[#23395d]/30`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-[#23395d]/60 text-white p-2.5 rounded-2xl backdrop-blur-xs flex items-center justify-center shadow-inner border border-white/10">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-base tracking-tight truncate leading-tight">
              Thầy Trần Đông
            </h2>
            <p className="text-[11px] text-blue-200/80 font-medium truncate">AI Trainer & GVCN</p>
          </div>
          <button
            id="sidebar-close-mobile-btn"
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-6 pt-5 pb-2 text-[11px] font-bold text-white/50 uppercase tracking-wider">
          Menu Chính
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-1 space-y-1.5 hide-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold text-left ${
                  isActive
                    ? "bg-white text-[#1c2e4a] shadow-lg shadow-black/20 translate-x-1.5 font-bold"
                    : "text-white/80 hover:bg-[#23395d]/30 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-[#1c2e4a]" : "text-white/70"
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.highlight && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#1c2e4a]/10 text-[#1c2e4a]"
                        : "bg-[#23395d] text-blue-100 animate-pulse border border-white/20"
                    }`}
                  >
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-5 mt-auto border-t border-white/10 space-y-3">
          <div className="bg-[#203354]/60 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-xs border border-white/10">
            <div className="w-10 h-10 rounded-full bg-white text-[#1c2e4a] font-bold flex items-center justify-center text-sm border-2 border-white/40 shadow-xs flex-shrink-0">
              TĐ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {classInfo.teacherName}
              </p>
              <p className="text-xs text-blue-200/80 truncate">
                Lớp {classInfo.className} • Chủ nhiệm
              </p>
            </div>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-[#23395d]/40 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};
