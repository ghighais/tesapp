import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Code2, 
  Eye, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  FileArchive, 
  Github, 
  ShieldCheck,
  Zap,
  RotateCcw,
  Columns,
  Maximize2
} from 'lucide-react';
import { ActiveTab, DatabaseItem, AppPage } from '../types';
import { PromptBox } from './studio/PromptBox';
import { CodeEditorBox } from './studio/CodeEditorBox';
import { PreviewBox } from './studio/PreviewBox';
import { DEFAULT_TEMPLATE_PAGES } from '../data/defaultTemplatePages';
import { generateAppWithQwen } from '../services/qwenAiService';

interface BerandaViewProps {
  onNavigate: (tab: ActiveTab) => void;
  databases: DatabaseItem[];
  githubConnected: boolean;
  githubUsername: string | null;
  repoCount: number;
  githubToken?: string;
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  onNavigate,
  databases,
  githubConnected,
  githubUsername,
  repoCount,
  githubToken = '',
}) => {
  // 1. Pages state (Multi-page app with persistence in localStorage)
  const [pages, setPages] = useState<AppPage[]>(() => {
    const saved = localStorage.getItem('ghighais_studio_pages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading saved studio pages', e);
      }
    }
    return DEFAULT_TEMPLATE_PAGES;
  });

  // Active page for coding & preview
  const [activePageId, setActivePageId] = useState<string>(() => {
    return localStorage.getItem('ghighais_studio_active_page_id') || 'index-html';
  });

  // Layout switcher: 'split' | 'preview-full' | 'code-full'
  const [workbenchLayout, setWorkbenchLayout] = useState<'split' | 'preview-full' | 'code-full'>('split');

  // 2. Prompt state
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('ghighais_studio_prompt') || '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('ghighais_qwen_api_key') || '';
  });

  // Track who last updated the code: 'prompt' | 'visual' | 'manual'
  const [lastUpdateSource, setLastUpdateSource] = useState<'prompt' | 'visual' | 'manual'>('manual');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Auto-save pages, active page, and prompt to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ghighais_studio_pages', JSON.stringify(pages));
    } catch (e) {
      console.warn('Unable to cache studio pages', e);
    }
  }, [pages]);

  useEffect(() => {
    if (activePageId) {
      localStorage.setItem('ghighais_studio_active_page_id', activePageId);
    }
  }, [activePageId]);

  useEffect(() => {
    localStorage.setItem('ghighais_studio_prompt', prompt);
  }, [prompt]);

  // Handle custom API key change
  const handleChangeApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem('ghighais_qwen_api_key', key);
  };

  // 3. Qwen AI Generation Handler
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setNotification(null);

    try {
      const result = await generateAppWithQwen({
        prompt,
        activePages: pages,
        customApiKey: customApiKey.trim() || undefined,
      });

      setPages(result.pages);
      setLastUpdateSource('prompt');
      setNotification({
        message: `Aplikasi berhasil digenerate (${result.modelUsed})! Semua halaman diperbarui tanpa error.`,
        type: 'success',
      });

      // If index-html exists, ensure it's selected
      const indexPage = result.pages.find((p) => p.name === 'index.html');
      if (indexPage) {
        setActivePageId(indexPage.id);
      }
    } catch (err: any) {
      console.error('Generation error', err);
      setNotification({
        message: `Terjadi kendala: ${err.message || 'Gagal memproses prompt'}`,
        type: 'info',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Update Page Content from Code Editor (Manual)
  const handleUpdatePageContent = (id: string, newContent: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, content: newContent } : p))
    );
    setLastUpdateSource('manual');
  };

  // 5. Update Page Content from Visual Inspector
  const handleApplyVisualEdit = (pageId: string, updatedHtml: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, content: updatedHtml } : p))
    );
    setLastUpdateSource('visual');
    setNotification({
      message: 'Perubahan visual telah disinkronkan ke kotak coding secara otomatis!',
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // 6. Add new page
  const handleAddNewPage = (name: string, title: string) => {
    const newId = `page-${Date.now()}`;
    const newPage: AppPage = {
      id: newId,
      name,
      title,
      type: 'html',
      content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style> body { font-family: 'Plus Jakarta Sans', sans-serif; } </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
  <header class="p-6 border-b border-slate-800 flex justify-between items-center max-w-7xl mx-auto w-full">
    <span class="font-bold text-lg text-white">App Bar</span>
    <a href="index.html" class="text-amber-400 text-sm font-semibold hover:underline">&larr; Kembali ke Beranda</a>
  </header>
  <main class="flex-1 max-w-5xl mx-auto p-8 w-full">
    <h1 class="text-3xl font-bold text-white mb-4">${title}</h1>
    <p class="text-slate-400 text-sm">Halaman baru ini siap diedit secara visual atau lewat kotak coding.</p>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
    };

    setPages((prev) => [...prev, newPage]);
    setActivePageId(newId);
  };

  // 7. Delete page
  const handleDeletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    if (activePageId === id) {
      setActivePageId('index-html');
    }
  };

  // 8. Load GitHub code into editor
  const handleLoadGitHubCodeToEditor = (fileName: string, content: string) => {
    const existing = pages.find((p) => p.name === fileName);
    if (existing) {
      handleUpdatePageContent(existing.id, content);
      setActivePageId(existing.id);
    } else {
      const newId = `gh-${Date.now()}`;
      const newPage: AppPage = {
        id: newId,
        name: fileName,
        title: `File GitHub: ${fileName}`,
        type: fileName.endsWith('.css') ? 'css' : fileName.endsWith('.js') ? 'js' : 'html',
        content,
      };
      setPages((prev) => [...prev, newPage]);
      setActivePageId(newId);
    }
    setNotification({
      message: `File "${fileName}" dari GitHub berhasil dimuat ke kotak coding!`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // 9. Reset to default template
  const handleResetTemplate = () => {
    if (confirm('Kembalikan ke template awal? Perubahan saat ini akan direset.')) {
      setPages(DEFAULT_TEMPLATE_PAGES);
      setActivePageId('index-html');
      setLastUpdateSource('manual');
      setNotification({
        message: 'Template awal berhasil dimuat kembali.',
        type: 'info',
      });
      setTimeout(() => setNotification(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* STATUS & CONTROL TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Qwen AI Studio Workspace</span>
          </div>

          <span className="text-xs text-neutral-400 hidden sm:inline">
            Aplikasi Multi-Halaman: {pages.filter(p => p.type === 'html').length} Halaman Aktif
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetTemplate}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset ke Template Awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('zip')}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>Export ZIP</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('github')}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Push GitHub</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification.message}</span>
          </span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. KOTAK PROMPT & KOTAK URL GITHUB */}
      <section id="studio-prompt-section">
        <PromptBox
          prompt={prompt}
          onChangePrompt={setPrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          onLoadGitHubCodeToEditor={handleLoadGitHubCodeToEditor}
          onAttachGitHubContext={(ctx) => setPrompt((prev) => (prev ? `${prev}\n\n${ctx}` : ctx))}
          githubToken={githubToken}
          customApiKey={customApiKey}
          onChangeApiKey={handleChangeApiKey}
        />
      </section>

      {/* 2. WORKSPACE CONTROLS & LAYOUT SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-medium text-xs">Tata Letak Workspace:</span>
          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              id="layout-split-btn"
              type="button"
              onClick={() => setWorkbenchLayout('split')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                workbenchLayout === 'split'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Bagi Dua (50:50)</span>
            </button>

            <button
              id="layout-preview-full-btn"
              type="button"
              onClick={() => setWorkbenchLayout('preview-full')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                workbenchLayout === 'preview-full'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Penuh</span>
            </button>

            <button
              id="layout-code-full-btn"
              type="button"
              onClick={() => setWorkbenchLayout('code-full')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                workbenchLayout === 'code-full'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Coding Penuh</span>
            </button>
          </div>
        </div>

        {workbenchLayout === 'preview-full' && (
          <span className="text-xs text-amber-300/90 font-medium">
            💡 Tip: Anda juga bisa menekan tombol <strong>"Full Halaman"</strong> di pojok kanan preview untuk tampilan layar penuh imersif.
          </span>
        )}
      </div>

      {/* 3. WORKSPACE: KOTAK CODING & KOTAK PREVIEW */}
      <section
        id="studio-workbench-section"
        className={`grid gap-6 items-start transition-all duration-200 ${
          workbenchLayout === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* KOTAK CODING */}
        {(workbenchLayout === 'split' || workbenchLayout === 'code-full') && (
          <div className="w-full">
            <CodeEditorBox
              pages={pages}
              activePageId={activePageId}
              onSelectPage={setActivePageId}
              onUpdatePageContent={handleUpdatePageContent}
              onAddNewPage={handleAddNewPage}
              onDeletePage={handleDeletePage}
              lastUpdateSource={lastUpdateSource}
            />
          </div>
        )}

        {/* KOTAK PREVIEW & VISUAL PAGE EDITOR */}
        {(workbenchLayout === 'split' || workbenchLayout === 'preview-full') && (
          <div className="w-full">
            <PreviewBox
              pages={pages}
              activePageId={activePageId}
              onSelectPage={setActivePageId}
              onApplyVisualEditToCode={handleApplyVisualEdit}
            />
          </div>
        )}
      </section>
    </div>
  );
};
