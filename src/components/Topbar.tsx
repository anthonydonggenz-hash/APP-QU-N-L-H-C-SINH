import React, { useState } from "react";
import {
  Menu,
  Bell,
  Sparkles,
  CalendarCheck,
  CheckCircle,
} from "lucide-react";
import { ClassInfo } from "../types.ts";

interface TopbarProps {
  classInfo: ClassInfo;
  onOpenMobileMenu: () => void;
  onQuickAttendance: () => void;
  onQuickAI: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  classInfo,
  onOpenMobileMenu,
  onQuickAttendance,
  onQuickAI,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const todayFormatted = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const notifications = [
    {
      id: 1,
      title: "Phụ huynh em Lê Ngọc Hân",
      desc: "Đã gửi đơn xin phép vắng học hôm nay vì lý do sức khỏe.",
      time: "15 phút trước",
      type: "leave",
    },
    {
      id: 2,
      title: "Họp phụ huynh sắp diễn ra",
      desc: "Đừng quên in phiếu tổng hợp kết quả giữa kỳ cho lớp.",
      time: "1 giờ trước",
      type: "reminder",
    },
    {
      id: 3,
      title: "Trợ lý AI sẵn sàng",
      desc: "Hệ thống đã chuẩn hóa mẫu nhận xét theo Thông tư 27.",
      time: "Hôm nay",
      type: "system",
    },
  ];

  return (
    <header
      id="app-topbar"
      className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100"
    >
      <div className="flex items-center gap-3">
        <button
          id="topbar-mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Mở danh mục"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              Quản Lý Lớp Học
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#23395d]/10 text-[#1c2e4a] border border-[#23395d]/20">
              Lớp {classInfo.className}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">
            {todayFormatted} • {classInfo.school}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick shortcut: Attendance */}
        <button
          id="topbar-quick-attendance-btn"
          onClick={onQuickAttendance}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 cursor-pointer"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Điểm danh ngay</span>
        </button>

        {/* Quick shortcut: AI Comment */}
        <button
          id="topbar-quick-ai-btn"
          onClick={onQuickAI}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1c2e4a] via-[#203354] to-[#23395d] hover:opacity-95 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">AI Nhận xét</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            id="topbar-notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100 transition relative cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#23395d] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div
                id="notifications-dropdown"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="font-bold text-sm text-slate-800">
                    Thông báo lớp học ({notifications.length})
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#1c2e4a] font-semibold hover:underline cursor-pointer"
                  >
                    Đã đọc hết
                  </button>
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto hide-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-slate-50 hover:bg-[#23395d]/5 rounded-xl transition cursor-pointer flex gap-3 items-start border border-slate-100/60"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#23395d] mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 mt-3 text-center">
                  <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Đồng bộ dữ liệu lớp học thời gian thực
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
