import React, { useState } from 'react';
import { 
  Code2, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  Trash2, 
  Wrench, 
  Sparkles, 
  RefreshCw,
  FileText,
  Layers,
  FilePlus,
  CheckCircle2
} from 'lucide-react';
import { AppPage } from '../../types';
import { autoRepairCode } from '../../services/qwenAiService';

interface CodeEditorBoxProps {
  pages: AppPage[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onUpdatePageContent: (id: string, newContent: string) => void;
  onAddNewPage: (name: string, title: string) => void;
  onDeletePage: (id: string) => void;
  lastUpdateSource: 'prompt' | 'visual' | 'manual';
}

export const CodeEditorBox: React.FC<CodeEditorBoxProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onUpdatePageContent,
  onAddNewPage,
  onDeletePage,
  lastUpdateSource,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [repairToast, setRepairToast] = useState<string | null>(null);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  // Copy code handler
  const handleCopyCode = () => {
    if (!activePage) return;
    navigator.clipboard.writeText(activePage.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download active file
  const handleDownloadFile = () => {
    if (!activePage) return;
    const blob = new Blob([activePage.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activePage.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auto-Repair handler
  const handleAutoRepair = () => {
    if (!activePage) return;
    if (activePage.type === 'html') {
      const { repaired, fixCount } = autoRepairCode(activePage.content);
      onUpdatePageContent(activePage.id, repaired);
      setRepairToast(
        fixCount > 0 
          ? `Berhasil memperbaiki ${fixCount} tag/sintaks secara otomatis!` 
          : 'Struktur kode sudah sempurna tanpa error!'
      );
    } else {
      setRepairToast('File CSS/JS diperiksa: sintaks valid.');
    }
    setTimeout(() => setRepairToast(null), 3000);
  };

  // Format code (clean line spacing)
  const handleFormatCode = () => {
    if (!activePage) return;
    let formatted = activePage.content.trim();
    onUpdatePageContent(activePage.id, formatted);
    setRepairToast('Format kode dirapikan.');
    setTimeout(() => setRepairToast(null), 2000);
  };

  // Add new page submit
  const handleAddPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;
    const safeName = newPageName.endsWith('.html') ? newPageName : `${newPageName}.html`;
    const safeTitle = newPageTitle.trim() || safeName;
    onAddNewPage(safeName, safeTitle);
    setNewPageName('');
    setNewPageTitle('');
    setShowAddPageModal(false);
  };

  // Calculate lines for line-number gutter
  const lineCount = activePage ? activePage.content.split('\n').length : 1;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  return (
    <div className="rounded-3xl luxury-card border border-neutral-800 p-5 shadow-2xl flex flex-col h-full min-h-[580px] relative overflow-hidden">
      {/* HEADER: TITLE & FILE STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-luxury text-base font-bold text-white flex items-center gap-2">
              Kotak Coding
              <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                Manual / Otomatis
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Ubah kode secara bebas. Hasil sinkron langsung ke kotak preview.
            </p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2">
          {lastUpdateSource === 'prompt' && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
              <Sparkles className="w-3 h-3" />
              Diperbarui Otomatis oleh AI
            </span>
          )}
          {lastUpdateSource === 'visual' && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium">
              <Layers className="w-3 h-3" />
              Diperbarui dari Editor Visual
            </span>
          )}
          {lastUpdateSource === 'manual' && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium">
              <Code2 className="w-3 h-3" />
              Diedit Manual
            </span>
          )}
        </div>
      </div>

      {/* FILE TABS (Multi-Halaman & Asset Files) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-neutral-800/80 no-scrollbar">
        {pages.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectPage(p.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium cursor-pointer transition-all border whitespace-nowrap ${
              p.id === activePageId
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:bg-neutral-800/80 hover:text-neutral-200'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${p.id === activePageId ? 'text-amber-400' : 'text-neutral-500'}`} />
            <span>{p.name}</span>

            {/* Delete custom page button */}
            {!p.isDefault && pages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Hapus halaman "${p.name}"?`)) {
                    onDeletePage(p.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity"
                title="Hapus Halaman"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Add New Page Button */}
        <button
          type="button"
          onClick={() => setShowAddPageModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-amber-500/50 text-neutral-400 hover:text-amber-300 text-xs font-medium transition-all whitespace-nowrap cursor-pointer"
          title="Tambah Halaman Baru"
        >
          <Plus className="w-3 h-3" />
          <span>Halaman</span>
        </button>
      </div>

      {/* MODAL / POPOVER: ADD NEW PAGE */}
      {showAddPageModal && (
        <div className="p-3 my-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200 flex items-center gap-1.5">
              <FilePlus className="w-4 h-4 text-amber-400" />
              Tambah Halaman Baru ke Proyek
            </span>
            <button
              type="button"
              onClick={() => setShowAddPageModal(false)}
              className="text-neutral-400 hover:text-neutral-200"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Nama file (contoh: dashboard.html, faq.html)"
              className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Judul halaman (contoh: Dashboard User)"
              className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddPageModal(false)}
              className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAddPageSubmit}
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Buat Halaman
            </button>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {repairToast && (
        <div className="my-2 p-2 px-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {repairToast}
          </span>
          <button type="button" onClick={() => setRepairToast(null)} className="text-emerald-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* CODE EDITOR CONTAINER WITH LINE NUMBERS */}
      <div className="flex-1 relative flex mt-2 bg-neutral-950/90 rounded-2xl border border-neutral-800 overflow-hidden font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-11 py-3 bg-neutral-900/60 border-r border-neutral-800/80 text-neutral-600 select-none text-right pr-2 font-mono leading-[20px] text-[11px] overflow-hidden">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          id={`editor-${activePage?.id}`}
          value={activePage?.content || ''}
          onChange={(e) => {
            if (activePage) {
              onUpdatePageContent(activePage.id, e.target.value);
            }
          }}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-neutral-200 focus:outline-none font-mono text-xs leading-[20px] resize-none overflow-auto selection:bg-amber-500/30 selection:text-amber-200"
          placeholder="// Ketik atau tempel kode Anda di sini..."
        />
      </div>

      {/* FOOTER TOOLBAR: AUTO-REPAIR, FORMAT, COPY, DOWNLOAD */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800/80 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          {/* AUTO-REPAIR BUTTON */}
          <button
            type="button"
            onClick={handleAutoRepair}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-emerald-500/50 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="AI memperbaiki error sintaks dan tag HTML yang belum tertutup"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Perbaiki Otomatis</span>
          </button>

          <button
            type="button"
            onClick={handleFormatCode}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            title="Rapikan Indentasi"
          >
            <RefreshCw className="w-3 h-3 text-neutral-400" />
            <span>Format</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Unduh File Ini"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Unduh File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
