import React, { useState } from "react";
import { GraduationCap, Lock, User, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface LoginProps {
  onLogin: (teacherName: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("thaydong");
  const [password, setPassword] = useState("123456");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin("Thầy Trần Đông - AI Trainer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1c2e4a] to-[#152238] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#23395d]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[32px] p-8 shadow-2xl border border-white/40 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1c2e4a] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20 border border-white/20">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản Lý Lớp Học
          </h1>
          <p className="text-xs font-bold text-[#1c2e4a] mt-0.5">
            Thầy Trần Đông - AI Trainer
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Hệ sinh thái số hỗ trợ Giáo viên chủ nhiệm & Trợ lý AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Tài khoản giáo viên
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1c2e4a] outline-none font-medium text-slate-800"
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1c2e4a] outline-none font-medium text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#1c2e4a] hover:bg-[#152238] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-black/10 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Vào lớp học ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Teacher Access */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => onLogin("Thầy Trần Đông - AI Trainer")}
            className="w-full py-2.5 px-4 rounded-xl bg-[#23395d]/10 hover:bg-[#23395d]/20 text-[#1c2e4a] text-xs font-bold transition flex items-center justify-center gap-2 border border-[#23395d]/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Đăng nhập nhanh với quyền Thầy Trần Đông - AI Trainer (Demo)</span>
          </button>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Dữ liệu được mã hóa và lưu trữ an toàn
          </p>
        </div>
      </div>
    </div>
  );
};
