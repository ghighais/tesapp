import React from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  FileCode2, 
  Database, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Laptop, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { AppPage, DatabaseItem } from '../types';

interface LoggedOutViewProps {
  userEmail: string;
  pages: AppPage[];
  databases: DatabaseItem[];
  lastSavedTime: string | null;
  onResume: () => void;
}

export const LoggedOutView: React.FC<LoggedOutViewProps> = ({
  userEmail,
  pages,
  databases,
  lastSavedTime,
  onResume,
}) => {
  const configuredDbs = databases.filter((db) => db.isConfigured);
  const formattedTime = lastSavedTime 
    ? new Date(lastSavedTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : 'Baru saja';
  const formattedDate = lastSavedTime
    ? new Date(lastSavedTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Hari ini';

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
      <div className="max-w-3xl w-full">
        
        {/* TOP BRAND EMBLEM & STATUS */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-[1px] shadow-2xl shadow-amber-900/50 mb-2">
            <div className="w-full h-full rounded-2xl bg-neutral-950 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sesi Telah Ditutup dengan Aman</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-luxury text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 tracking-wide">
            Pekerjaan Anda Tersimpan 100%
          </h1>
          
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Semua progres codingan, multi-halaman aplikasi, hasil editan visual, dan konfigurasi database Anda tersimpan secara permanen di perangkat ini. Anda dapat melanjutkannya kapan saja tanpa ada yang hilang.
          </p>
        </div>

        {/* WORKSPACE SNAPSHOT CARD */}
        <div className="rounded-3xl luxury-card border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden mb-8">
          
          {/* Subtle golden ambient light */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* User Account & Device Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 font-bold text-base shadow-inner">
                {userEmail.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-200 text-sm">{userEmail}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Akun Pengembang
                  </span>
                </div>
                <span className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <Laptop className="w-3 h-3 text-neutral-400" />
                  Perangkat Tersinkronisasi • Penyimpanan Lokal Aktif
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/80 px-3.5 py-1.5 rounded-xl border border-neutral-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Disimpan: {formattedDate}, {formattedTime}</span>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Pages */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">Halaman Aplikasi</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black font-luxury text-white">
                {pages.length} <span className="text-xs font-sans text-neutral-400 font-normal">Halaman</span>
              </div>
              <div className="text-[11px] text-neutral-500 truncate">
                {pages.map(p => p.name).join(', ')}
              </div>
            </div>

            {/* Database */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">Database Siap</span>
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-luxury text-white">
                {configuredDbs.length} <span className="text-xs font-sans text-neutral-400 font-normal">/ 11 Tersambung</span>
              </div>
              <div className="text-[11px] text-neutral-500">
                PostgreSQL, Supabase &amp; NoSQL
              </div>
            </div>

            {/* Safety Guarantee */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">Status Pekerjaan</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 pt-1">
                Tersimpan Utuh
              </div>
              <div className="text-[11px] text-neutral-500">
                Tidak ada data yang terhapus
              </div>
            </div>
          </div>

          {/* Files List Preview */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-amber-400" />
              Berkas Pekerjaan yang Tersimpan di Perangkat Ini:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {pages.map((p) => (
                <div 
                  key={p.id}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{p.name}</span>
                  <span className="text-neutral-500 text-[10px]">({p.content.length} bytes)</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRIMARY RESUME CTA BUTTON */}
          <div className="pt-2">
            <button
              id="resume-session-btn"
              type="button"
              onClick={onResume}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black text-base flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-neutral-950" />
              <span>Masuk Kembali &amp; Lanjutkan Pekerjaan</span>
              <ArrowRight className="w-5 h-5 text-neutral-950" />
            </button>
            <p className="text-center text-xs text-neutral-500 mt-2.5">
              Klik untuk langsung membuka workspace dan kembali melanjutkan codingan tepat di posisi terakhir Anda.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
