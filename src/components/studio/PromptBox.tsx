import React, { useState } from 'react';
import { 
  Sparkles, 
  Github, 
  ArrowRight, 
  Loader2, 
  ExternalLink, 
  FileCode, 
  Folder, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Key, 
  Info, 
  X,
  FileText,
  Copy,
  Zap,
  Star,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Layers,
  Palette,
  Wand2
} from 'lucide-react';
import { GitHubUrlContent } from '../../types';
import { fetchGitHubUrlContent } from '../../services/githubUrlService';
import { analyzePromptSemantics, PromptAnalysis } from '../../services/smartPromptAnalyzer';

interface PromptBoxProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onLoadGitHubCodeToEditor: (fileName: string, content: string) => void;
  onAttachGitHubContext: (summary: string) => void;
  githubToken?: string;
  customApiKey: string;
  onChangeApiKey: (key: string) => void;
}

export const PromptBox: React.FC<PromptBoxProps> = ({
  prompt,
  onChangePrompt,
  onGenerate,
  isGenerating,
  onLoadGitHubCodeToEditor,
  onAttachGitHubContext,
  githubToken,
  customApiKey,
  onChangeApiKey,
}) => {
  // GitHub URL Box State
  const [githubUrl, setGithubUrl] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubContent, setGithubContent] = useState<GitHubUrlContent | null>(null);
  const [showGithubViewer, setShowGithubViewer] = useState(false);
  const [selectedGithubFile, setSelectedGithubFile] = useState<{ name: string; content: string } | null>(null);
  const [copiedContext, setCopiedContext] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Smart Prompt Semantic Analysis State
  const [showPromptAnalysis, setShowPromptAnalysis] = useState(false);
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(null);

  // Quick Prompt Templates
  const promptTemplates = [
    { label: 'E-Commerce Modern', text: 'Buat aplikasi toko online modern dengan katalog produk, keranjang belanja interaktif, filter kategori, dan halaman checkout elegan' },
    { label: 'Dashboard Fintech', text: 'Buat dashboard analitik keuangan modern dark-mode dengan grafik pendapatan, metrik konversi, riwayat transaksi, dan navigasi multi-halaman' },
    { label: 'SaaS Landing Page', text: 'Buat landing page SaaS kecerdasan buatan kelas dunia dengan hero section mewah, fitur unggulan, tabel perbandingan harga, dan formulir kontak' },
    { label: 'Portofolio Kreatif', text: 'Buat portofolio agensi desain interaktif dengan galeri karya, slider testimoni, kartu profil tim, dan form kontak responsif' },
  ];

  // Handler for Fetching GitHub URL
  const handleFetchGithub = async () => {
    if (!githubUrl.trim()) return;
    setIsFetchingGithub(true);
    try {
      const result = await fetchGitHubUrlContent(githubUrl, githubToken);
      setGithubContent(result);
      setShowGithubViewer(true);

      if (result.type === 'file' && result.fileContent && result.fileName) {
        setSelectedGithubFile({
          name: result.fileName,
          content: result.fileContent,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // Attach as Prompt Context
  const handleAttachContext = () => {
    if (!githubContent) return;
    let summary = `Referensi GitHub: ${githubContent.owner}/${githubContent.repo}`;
    if (githubContent.repoInfo?.description) {
      summary += ` - ${githubContent.repoInfo.description}`;
    }
    if (selectedGithubFile) {
      summary += `\nFile ${selectedGithubFile.name}:\n${selectedGithubFile.content.slice(0, 500)}...`;
    }
    onAttachGitHubContext(summary);
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  // Run Semantic Prompt Analysis
  const handleAnalyzePrompt = () => {
    if (!prompt.trim()) return;
    const analysis = analyzePromptSemantics(prompt, githubContent ? `${githubContent.owner}/${githubContent.repo}` : undefined);
    setPromptAnalysis(analysis);
    setShowPromptAnalysis(true);
  };

  return (
    <div className="rounded-3xl luxury-card border border-amber-500/25 p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: TITLE & MODEL BADGE */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/30">
            Q
          </div>
          <div>
            <h2 className="font-luxury text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Kotak Prompt AI
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-sans font-semibold">
                Unlimited Gratis
              </span>
            </h2>
            <p className="text-xs text-neutral-400 font-light">
              Didukung arsitektur <strong className="text-amber-300 font-medium">Qwen 2.5 Coder</strong> — Desain mewah, otomatis bebas error.
            </p>
          </div>
        </div>

        {/* Action badges: Qwen Model & Optional API Key */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="px-3 py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium transition-all flex items-center gap-1.5"
            title="Pengaturan Kunci API Opsional"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{customApiKey ? 'API Key Kustom Aktif' : 'Atur API Key (Opsional)'}</span>
            {showApiKeyInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* OPTIONAL CUSTOM API KEY DRAWER */}
      {showApiKeyInput && (
        <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs space-y-2 relative z-10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              API Key Opsional (OpenRouter / HuggingFace / DashScope)
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              Mode Default: Unlimited Gratis Tanpa Key
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => onChangeApiKey(e.target.value)}
              placeholder="sk-or-v1-... (Kosongkan jika ingin memakai mesin gratis tanpa batas)"
              className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
            />
            {customApiKey && (
              <button
                type="button"
                onClick={() => onChangeApiKey('')}
                className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-800 rounded-lg"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* PROMPT TEXTAREA */}
      <div className="space-y-2 relative z-10">
        <div className="relative">
          <textarea
            id="qwen-prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => onChangePrompt(e.target.value)}
            placeholder="Tuliskan ide aplikasi atau perbaikan yang Anda inginkan... (Contoh: 'Buat aplikasi marketplace produk kerajinan dengan keranjang belanja, filter kategori, navigasi multi-halaman beranda, tentang, dan kontak')"
            className="w-full px-4 py-3.5 rounded-2xl bg-neutral-950/90 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 text-sm leading-relaxed transition-all resize-y min-h-[96px]"
          />
        </div>

        {/* QUICK TEMPLATES CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-neutral-500 whitespace-nowrap font-medium text-[11px]">Ide Cepat:</span>
          {promptTemplates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChangePrompt(tpl.text)}
              className="px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-200 text-xs whitespace-nowrap transition-all cursor-pointer"
            >
              {tpl.label}
            </button>
          ))}
        </div>

        {/* ACTION ROW: SMART PROMPT ANALYZER TRIGGER */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleAnalyzePrompt}
            disabled={!prompt.trim()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent hover:from-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-amber-500/10"
          >
            <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Analisa Cerdas Prompt AI</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] text-amber-200 font-bold uppercase tracking-wider">
              Smart Engine
            </span>
          </button>

          <div className="flex items-center gap-3 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Unlimited Gratis Tanpa Batas
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="hidden sm:inline text-neutral-400">Arsitektur Multi-Halaman &amp; Tailwind</span>
          </div>
        </div>

        {/* SMART PROMPT SEMANTIC ANALYSIS MODAL / DRAWER */}
        {showPromptAnalysis && promptAnalysis && (
          <div className="p-4 rounded-2xl bg-neutral-900/95 border border-amber-500/30 text-xs space-y-3.5 shadow-2xl relative z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-neutral-100 text-sm">
                  Hasil Analisa Semantik Cerdas Qwen
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  {promptAnalysis.categoryName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPromptAnalysis(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Identitas Bisnis & Palet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Nama &amp; Konsep Brand
                </span>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  {promptAnalysis.businessIdentity.name}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {promptAnalysis.businessIdentity.tagline}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                  <Palette className="w-3 h-3 text-amber-400" />
                  Gaya &amp; Palet Desain
                </span>
                <div className="text-xs font-semibold text-neutral-200">
                  Aksen: <strong className="text-amber-300 capitalize">{promptAnalysis.primaryColor}</strong>, Mode Dark Slate Mewah
                </div>
                <p className="text-[11px] text-neutral-400">
                  Tipografi Plus Jakarta Sans, high-contrast WCAG AA, responsive mobile-first.
                </p>
              </div>
            </div>

            {/* Arsitektur Halaman & Fitur Interaktif */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Rencana Struktur File &amp; Halaman Terintegrasi:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {promptAnalysis.pages.map((pg, i) => (
                  <div key={i} className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-amber-400 font-semibold">{pg.name}</span>
                    <span className="text-[10px] text-neutral-400 truncate">({pg.role})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fitur Cerdas Yang Akan Dibuat */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase text-neutral-500 tracking-wider">
                Fitur Interaktif Cerdas Terdeteksi
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptAnalysis.features.map((feat, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px]">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Enhanced Prompt Box */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-300 text-xs flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  Prompt yang Dipertajam Secara Otomatis
                </span>
                <button
                  type="button"
                  onClick={() => onChangePrompt(promptAnalysis.enhancedPrompt)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[10px] transition-all cursor-pointer"
                >
                  Terapkan ke Kotak Prompt
                </button>
              </div>
              <p className="text-[11px] text-neutral-300 font-mono leading-relaxed bg-neutral-950/60 p-2 rounded-lg border border-neutral-800">
                {promptAnalysis.enhancedPrompt}
              </p>
            </div>

            {/* Action footer */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowPromptAnalysis(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
              >
                Tutup Analisa
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPromptAnalysis(false);
                  onGenerate();
                }}
                disabled={isGenerating}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                ⚡ Generate Langsung dengan Analisa Ini
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INTEGRATED GITHUB URL INPUT BOX */}
      <div className="rounded-2xl bg-neutral-950/70 border border-neutral-800/90 p-3.5 space-y-3 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
            <Github className="w-4 h-4 text-amber-400" />
            <span>Kotak URL GitHub</span>
            <span className="text-[11px] font-normal text-neutral-500">
              (Ambil isi repositori, kode file, atau jadikan referensi prompt)
            </span>
          </label>

          {githubContent && (
            <button
              type="button"
              onClick={() => setShowGithubViewer(!showGithubViewer)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto font-medium cursor-pointer"
            >
              {showGithubViewer ? 'Tutup Tampilan GitHub' : 'Buka Konten Terambil'}
              {showGithubViewer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* GITHUB INPUT + ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFetchGithub();
                }
              }}
              placeholder="https://github.com/pemilik/repositori atau URL file blob..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
            />
            {githubUrl && (
              <button
                type="button"
                onClick={() => {
                  setGithubUrl('');
                  setGithubContent(null);
                  setShowGithubViewer(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleFetchGithub}
            disabled={isFetchingGithub || !githubUrl.trim()}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/40 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isFetchingGithub ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Mengambil...</span>
              </>
            ) : (
              <>
                <Github className="w-3.5 h-3.5 text-amber-400" />
                <span>Ambil Isi GitHub</span>
              </>
            )}
          </button>
        </div>

        {/* GITHUB CONTENT VIEWER MODAL / DRAWER */}
        {showGithubViewer && githubContent && (
          <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-3 animate-in fade-in duration-200">
            {githubContent.error ? (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{githubContent.error}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Repo summary banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 text-xs">
                      {githubContent.owner}/{githubContent.repo}
                    </span>
                    {githubContent.repoInfo && (
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          {githubContent.repoInfo.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3 text-neutral-400" />
                          {githubContent.repoInfo.forks}
                        </span>
                        {githubContent.repoInfo.language && (
                          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {githubContent.repoInfo.language}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAttachContext}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1 transition-all"
                    >
                      {copiedContext ? <Check className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3" />}
                      <span>{copiedContext ? 'Terselip di Prompt!' : 'Jadikan Konteks AI'}</span>
                    </button>

                    <a
                      href={githubContent.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-neutral-400 hover:text-white"
                      title="Buka di GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Repository File Tree & Content Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-hidden">
                  {/* Left: Files List */}
                  <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-2 overflow-y-auto max-h-48 text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-neutral-400 px-1 mb-1">
                      Berkas Repositori ({githubContent.files?.length || 0}):
                    </div>
                    {githubContent.files && githubContent.files.length > 0 ? (
                      githubContent.files.map((file, idx) => (
                        <div
                          key={idx}
                          onClick={async () => {
                            if (file.type === 'file' && file.download_url) {
                              try {
                                const fRes = await fetch(file.download_url);
                                const fText = await fRes.text();
                                setSelectedGithubFile({ name: file.name, content: fText });
                              } catch (err) {
                                console.error('Failed to load file', err);
                              }
                            }
                          }}
                          className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                            selectedGithubFile?.name === file.name
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                              : 'hover:bg-neutral-900 text-neutral-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate text-[11px]">
                            {file.type === 'dir' ? (
                              <Folder className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <FileCode className="w-3 h-3 text-cyan-400 shrink-0" />
                            )}
                            <span className="truncate">{file.name}</span>
                          </span>

                          {file.type === 'file' && (
                            <span className="text-[10px] text-neutral-500">
                              {file.size ? `${Math.round(file.size / 1024)}KB` : ''}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-neutral-500 p-2">
                        {githubContent.fileName ? `File tunggal: ${githubContent.fileName}` : 'Tidak ada berkas yang dimuat'}
                      </div>
                    )}
                  </div>

                  {/* Right: Selected File Preview & Use button */}
                  <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-2 flex flex-col justify-between max-h-48 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-neutral-800">
                        <span className="font-semibold text-neutral-300 text-[11px] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-amber-400" />
                          {selectedGithubFile?.name || githubContent.fileName || 'Pratinjau Kode'}
                        </span>
                        {(selectedGithubFile || githubContent.fileContent) && (
                          <button
                            type="button"
                            onClick={() => {
                              const name = selectedGithubFile?.name || githubContent.fileName || 'github-code.html';
                              const content = selectedGithubFile?.content || githubContent.fileContent || '';
                              onLoadGitHubCodeToEditor(name, content);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold transition-all cursor-pointer"
                          >
                            Pakai di Editor Coding
                          </button>
                        )}
                      </div>

                      <pre className="font-mono text-[10px] text-neutral-400 overflow-y-auto max-h-32 p-1 bg-neutral-900/50 rounded">
                        {selectedGithubFile?.content || githubContent.fileContent || '// Pilih berkas di sebelah kiri untuk melihat isi kode'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GENERATE BUTTON */}
      <div className="flex items-center justify-between gap-4 pt-1 relative z-10">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Garansi zero-error: kode diperiksa dan diperbaiki otomatis sebelum tayang.</span>
        </div>

        <button
          id="btn-generate-qwen"
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              <span>Memproses dengan Qwen AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>Generate dengan Qwen AI</span>
              <ArrowRight className="w-4 h-4 text-neutral-950" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
