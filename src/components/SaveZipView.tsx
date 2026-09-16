import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  FileArchive, 
  Download, 
  Check, 
  FileCode, 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  Sparkles, 
  HardDrive, 
  CheckCircle2, 
  RefreshCw,
  FolderArchive,
  Shield
} from 'lucide-react';
import { DatabaseItem, GitHubUser, GitHubRepo } from '../types';

interface SaveZipViewProps {
  databases: DatabaseItem[];
  currentUser: GitHubUser | null;
  repos: GitHubRepo[];
}

interface ExportFile {
  name: string;
  path: string;
  category: 'env' | 'code' | 'doc' | 'json' | 'git';
  description: string;
  content: string;
  selected: boolean;
}

export const SaveZipView: React.FC<SaveZipViewProps> = ({
  databases,
  currentUser,
  repos,
}) => {
  const [zipFileName, setZipFileName] = useState('ghighais-ai-export.zip');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generate dynamic file contents based on current state
  const generateInitialFiles = (): ExportFile[] => {
    // 1. .env file
    let envContent = '# ==========================================\n# GHIGHAIS AI - ENVIRONMENT VARIABLES\n# ==========================================\n\n';
    databases.forEach((db) => {
      envContent += `# --- ${db.name} (${db.category}) ---\n`;
      db.fields.forEach((f) => {
        const envKey = `${db.id.toUpperCase()}_${f.key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
        envContent += `${envKey}="${f.value || ''}"\n`;
      });
      envContent += '\n';
    });

    // 2. database-connections.json
    const dbJson = JSON.stringify(
      {
        generator: 'GHIGHAIS AI Luxe Suite',
        generatedAt: new Date().toISOString(),
        totalDatabases: databases.length,
        databases: databases.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          recommended: d.recommended || false,
          required: d.required || false,
          isConfigured: d.isConfigured,
          credentials: d.fields.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {} as Record<string, string>),
        })),
      },
      null,
      2
    );

    // 3. github-manifest.json
    const ghJson = JSON.stringify(
      {
        connected: !!currentUser,
        user: currentUser
          ? {
              login: currentUser.login,
              name: currentUser.name,
              url: currentUser.html_url,
              publicRepos: currentUser.public_repos,
            }
          : null,
        totalRepos: repos.length,
        repositories: repos.map((r) => ({
          name: r.name,
          fullName: r.full_name,
          private: r.private,
          url: r.html_url,
          defaultBranch: r.default_branch,
          language: r.language,
          stars: r.stargazers_count,
        })),
      },
      null,
      2
    );

    // 4. Turso client code
    const tursoUrl = databases.find((d) => d.id === 'turso')?.fields.find((f) => f.key === 'url')?.value || 'libsql://my-db.turso.io';
    const tursoToken = databases.find((d) => d.id === 'turso')?.fields.find((f) => f.key === 'authToken')?.value || 'TURSO_AUTH_TOKEN';
    const tursoClientCode = `/**
 * GHIGHAIS AI - Turso libSQL Client Integration
 * Installation: npm install @libsql/client
 */
import { createClient } from '@libsql/client';

export const turso = createClient({
  url: process.env.TURSO_URL || '${tursoUrl}',
  authToken: process.env.TURSO_AUTH_TOKEN || '${tursoToken}',
});

export async function executeQuery(query: string, args: any[] = []) {
  try {
    const result = await turso.execute({ sql: query, args });
    return result;
  } catch (error) {
    console.error('[Turso Client Error]:', error);
    throw error;
  }
}
`;

    // 5. Supabase client code
    const spUrl = databases.find((d) => d.id === 'supabase')?.fields.find((f) => f.key === 'url')?.value || 'https://xyz.supabase.co';
    const spAnonKey = databases.find((d) => d.id === 'supabase')?.fields.find((f) => f.key === 'anonKey')?.value || 'SUPABASE_ANON_KEY';
    const supabaseClientCode = `/**
 * GHIGHAIS AI - Supabase Client Integration (Recommended Database)
 * Installation: npm install @supabase/supabase-js
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '${spUrl}';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '${spAnonKey}';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
`;

    // 6. .gitignore (Wajib ada untuk keamanan saat push ke GitHub atau unduh ZIP)
    const gitignoreContent = `# ==========================================
# GHIGHAIS AI - SECURE .GITIGNORE
# Files & directories ignored for GitHub & ZIP security
# ==========================================

# Environment & Secrets
.env
.env.local
.env.production
*.pem
*.key
credentials.json
service-account.json

# Dependencies
node_modules/

# Production & Build outputs
.next/
out/
dist/
build/
.vercel/
.cache/

# Operating System Files
.DS_Store
Thumbs.db

# IDE & Editor Configs
.vscode/
.idea/
*.swp
*.swo
*~

# Database & SQLite files
*.sqlite
*.db
*.sql
prisma/dev.db
`;

    // 7. README.md
    const readmeContent = `# GHIGHAIS AI - Exported Project Workspace

Selamat datang di paket arsitektur yang diekspor melalui platform **GHIGHAIS AI**.

## 💎 Ringkasan Paket
- **Waktu Ekspor:** ${new Date().toLocaleString('id-ID')}
- **GitHub Terhubung:** ${currentUser ? `@${currentUser.login}` : 'Belum dihubungkan'}
- **Total Repositori:** ${repos.length} repositori
- **Total Database Terdaftar:** 11 database (Supabase Rekomendasi & Turso Wajib)
- **Proteksi Keamanan:** Dilengkapi \`.gitignore\` lengkap mencegah kebocoran kredensial dan file sensitif ke GitHub.

## 📁 Struktur Berkas dalam ZIP:
1. \`.gitignore\` - Wajib ada: melindungi .env, token, credential, cache, dan build files saat push ke GitHub.
2. \`.env\` - Kumpulan variabel lingkungan berisi URL dan Token database yang telah Anda konfigurasikan.
3. \`database-config.json\` - Konfigurasi terstruktur dari seluruh 11 database.
4. \`github-manifest.json\` - Informasi akun dan daftar repositori GitHub Anda.
5. \`src/turso-client.ts\` - Template koneksi libSQL/Turso siap pakai.
6. \`src/supabase-client.ts\` - Template koneksi Supabase JS siap pakai.

## 🚀 Cara Menjalankan Klien Database:
Salin berkas \`.env\` ke root proyek Anda dan pasang dependensi:
\`\`\`bash
npm install @supabase/supabase-js @libsql/client
\`\`\`

---
*Dibuat dengan GHIGHAIS AI - Enterprise Cloud & Git Architecture Suite.*
`;

    return [
      {
        name: '.gitignore',
        path: '.gitignore',
        category: 'git',
        description: 'Wajib ada: amankan .env, token, secret key, SQLite, build files, dan cache dari GitHub/ZIP',
        content: gitignoreContent,
        selected: true,
      },
      {
        name: '.env',
        path: '.env',
        category: 'env',
        description: 'Berkas variabel lingkungan berisi seluruh token & kredensial 11 database',
        content: envContent,
        selected: true,
      },
      {
        name: 'database-config.json',
        path: 'database-config.json',
        category: 'json',
        description: 'Data terstruktur JSON dari semua database terdaftar',
        content: dbJson,
        selected: true,
      },
      {
        name: 'github-manifest.json',
        path: 'github-manifest.json',
        category: 'json',
        description: 'Data profil akun GitHub dan daftar repositori yang telah disinkronisasi',
        content: ghJson,
        selected: true,
      },
      {
        name: 'turso-client.ts',
        path: 'src/turso-client.ts',
        category: 'code',
        description: 'Kode klien TypeScript siap pakai untuk Turso libSQL (Wajib Ada)',
        content: tursoClientCode,
        selected: true,
      },
      {
        name: 'supabase-client.ts',
        path: 'src/supabase-client.ts',
        category: 'code',
        description: 'Kode klien TypeScript siap pakai untuk Supabase (Rekomendasi Utama)',
        content: supabaseClientCode,
        selected: true,
      },
      {
        name: 'README.md',
        path: 'README.md',
        category: 'doc',
        description: 'Dokumentasi panduan penggunaan arsitektur dan langkah instalasi',
        content: readmeContent,
        selected: true,
      },
    ];
  };

  const [files, setFiles] = useState<ExportFile[]>(generateInitialFiles());
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);

  // Toggle file selection checkbox
  const toggleFileSelect = (index: number) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, selected: !f.selected } : f))
    );
  };

  // Update file content in viewer
  const handleContentChange = (index: number, newContent: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, content: newContent } : f))
    );
  };

  // Add custom file
  const handleAddCustomFile = () => {
    const newFileName = prompt('Masukkan nama berkas baru (contoh: notes.txt atau config.json):', 'custom-notes.txt');
    if (!newFileName) return;

    const newFile: ExportFile = {
      name: newFileName,
      path: newFileName,
      category: newFileName.endsWith('.json') ? 'json' : newFileName.endsWith('.ts') ? 'code' : 'doc',
      description: 'Berkas kustom tambahan yang ditambahkan oleh pengguna',
      content: `# Berkas Kustom GHIGHAIS AI\nDitambahkan pada: ${new Date().toISOString()}\n\nTulis konten kustom Anda di sini...`,
      selected: true,
    };

    setFiles((prev) => [...prev, newFile]);
    setSelectedFileIndex(files.length);
  };

  // Delete file
  const handleDeleteFile = (index: number) => {
    if (files.length <= 1) {
      alert('Minimal harus ada satu berkas dalam arsip.');
      return;
    }
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    setSelectedFileIndex(0);
  };

  // Copy active file content
  const handleCopyFile = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey('active-file');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // GENERATE AND DOWNLOAD ZIP FILE
  const handleDownloadZip = async () => {
    const selectedFiles = files.filter((f) => f.selected);
    if (selectedFiles.length === 0) {
      alert('Pilih minimal satu berkas untuk dimasukkan ke dalam arsip ZIP.');
      return;
    }

    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const zip = new JSZip();

      // Append files to zip
      selectedFiles.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Generate blob
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFileName.endsWith('.zip') ? zipFileName : `${zipFileName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      alert('Gagal menghasilkan berkas ZIP. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeFile = files[selectedFileIndex] || files[0];
  const selectedFilesCount = files.filter((f) => f.selected).length;
  const totalSizeBytes = files
    .filter((f) => f.selected)
    .reduce((acc, curr) => acc + new Blob([curr.content]).size, 0);

  return (
    <div className="space-y-10 pb-16">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <FileArchive className="w-3.5 h-3.5" />
            <span>Save Zip Client Engine</span>
          </div>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-neutral-100">
            Ekspor Arsip Paket ZIP
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-2xl">
            Kemas seluruh konfigurasi 11 database, token terisi, manifes repositori GitHub, serta template klien TypeScript ke dalam satu berkas .zip siap unduh.
          </p>
        </div>

        {/* DOWNLOAD ACTION BUTTON */}
        <button
          id="btn-download-zip-top"
          onClick={handleDownloadZip}
          disabled={isGenerating || selectedFilesCount === 0}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-neutral-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-900/40 hover:shadow-amber-500/30 flex items-center gap-2.5 cursor-pointer transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Memproses Berkas ZIP...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh ZIP Sekarang ({selectedFilesCount} Berkas)</span>
            </>
          )}
        </button>
      </div>

      {/* DOWNLOAD SUCCESS ALERT */}
      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-neutral-900 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Berkas <strong>{zipFileName}</strong> berhasil dibuat dan diunduh ke komputer Anda!
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            {(totalSizeBytes / 1024).toFixed(2)} KB
          </span>
        </div>
      )}

      {/* ZIP CONFIGURATION BAR */}
      <section className="luxury-card rounded-2xl p-5 border border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <label htmlFor="zip-filename-input" className="text-xs font-semibold text-neutral-200">
              Nama Berkas ZIP Output:
            </label>
            <input
              id="zip-filename-input"
              type="text"
              value={zipFileName}
              onChange={(e) => setZipFileName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500/50 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-400 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
          <div>
            <span>Berkas Terpilih: </span>
            <strong className="text-neutral-200">{selectedFilesCount} dari {files.length}</strong>
          </div>
          <div>
            <span>Estimasi Ukuran: </span>
            <strong className="text-amber-400 font-mono">{(totalSizeBytes / 1024).toFixed(2)} KB</strong>
          </div>
          <button
            onClick={handleAddCustomFile}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Tambah Berkas</span>
          </button>
        </div>
      </section>

      {/* FILE MANAGER & LIVE PREVIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FILE CHECKLIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-300">
              Daftar Berkas yang Akan Di-Zip
            </span>
            <span className="text-[11px]">Klik untuk melihat isi</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {files.map((file, idx) => {
              const isCurrent = selectedFileIndex === idx;
              return (
                <div
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={file.selected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleFileSelect(idx);
                      }}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />

                    {/* Icon based on type */}
                    {file.category === 'code' ? (
                      <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : file.category === 'env' ? (
                      <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}

                    <div className="truncate">
                      <span className="text-xs font-mono font-bold text-neutral-200 block truncate">
                        {file.path}
                      </span>
                      <span className="text-[10px] text-neutral-400 line-clamp-1">
                        {file.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pl-2">
                    {files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(idx);
                        }}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                        title="Hapus dari paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE FILE PREVIEW & EDITOR (7 COLS) */}
        <div className="lg:col-span-7 luxury-card rounded-2xl border border-neutral-800 flex flex-col min-h-[500px]">
          
          {/* Viewer Toolbar */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300">
                {activeFile.path}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase font-mono">
                {activeFile.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyFile(activeFile.content)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Salin isi berkas"
              >
                {copiedKey === 'active-file' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor / Content Area */}
          <div className="p-4 flex-1 flex flex-col bg-black/70 rounded-b-2xl">
            <textarea
              value={activeFile.content}
              onChange={(e) => handleContentChange(selectedFileIndex, e.target.value)}
              className="w-full flex-1 min-h-[380px] bg-transparent text-neutral-200 font-mono text-xs leading-relaxed focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        </div>

      </div>

      {/* BOTTOM ACTION CTA */}
      <div className="p-6 rounded-2xl luxury-card border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-luxury text-base font-bold text-neutral-100">
            Siap Mengekspor Arsitektur GHIGHAIS AI?
          </h3>
          <p className="text-xs text-neutral-400">
            Berkas ZIP akan langsung dihasilkan di peramban Anda dengan struktur direktori rapi.
          </p>
        </div>

        <button
          id="btn-download-zip-bottom"
          onClick={handleDownloadZip}
          disabled={isGenerating || selectedFilesCount === 0}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-neutral-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-900/40 hover:shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Membuat Arsip ZIP...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh Arsip ZIP ({selectedFilesCount} Berkas)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
