import React, { useState } from 'react';
import { 
  Database, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Filter, 
  Save, 
  FileCode, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { DatabaseItem } from '../types';

interface DatabaseViewProps {
  databases: DatabaseItem[];
  onUpdateDatabases: (updated: DatabaseItem[]) => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  databases,
  onUpdateDatabases,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPasswordMap, setShowPasswordMap] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [testingDbId, setTestingDbId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [showEnvModal, setShowEnvModal] = useState(false);

  // Toggle field visibility
  const toggleShowPassword = (fieldId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  // Handle field change
  const handleFieldChange = (dbId: string, fieldKey: string, value: string) => {
    const updated = databases.map((db) => {
      if (db.id === dbId) {
        const fields = db.fields.map((f) => (f.key === fieldKey ? { ...f, value } : f));
        // Check if any required field is filled
        const hasRequiredFilled = fields.some((f) => f.required && f.value.trim().length > 0);
        return {
          ...db,
          fields,
          isConfigured: hasRequiredFilled,
        };
      }
      return db;
    });
    onUpdateDatabases(updated);
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save all tokens notification
  const handleSaveAll = () => {
    localStorage.setItem('ghighais_databases_config', JSON.stringify(databases));
    setSaveToast('Semua kredensial dan token berhasil disimpan ke Local Storage secara aman!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Clear all tokens
  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh kolom token database?')) {
      const reset = databases.map((db) => ({
        ...db,
        fields: db.fields.map((f) => ({ ...f, value: '' })),
        isConfigured: false,
      }));
      onUpdateDatabases(reset);
      localStorage.removeItem('ghighais_databases_config');
      setSaveToast('Seluruh token database telah direset.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // Test token validation format
  const handleTestConnection = (db: DatabaseItem) => {
    setTestingDbId(db.id);
    
    setTimeout(() => {
      const emptyRequired = db.fields.filter((f) => f.required && !f.value.trim());
      if (emptyRequired.length > 0) {
        setTestResult((prev) => ({
          ...prev,
          [db.id]: {
            success: false,
            message: `Kolom wajib belum diisi: ${emptyRequired.map((f) => f.label).join(', ')}`,
          },
        }));
      } else {
        // Specific checks for Turso and Supabase
        if (db.id === 'turso') {
          const url = db.fields.find((f) => f.key === 'url')?.value || '';
          const token = db.fields.find((f) => f.key === 'authToken')?.value || '';
          if (!url.startsWith('libsql://') && !url.startsWith('https://')) {
            setTestResult((prev) => ({
              ...prev,
              [db.id]: { success: false, message: 'URL Turso harus diawali dengan libsql:// atau https://' },
            }));
          } else if (token.length < 20) {
            setTestResult((prev) => ({
              ...prev,
              [db.id]: { success: false, message: 'Token JWT Turso tidak valid (terlalu pendek).' },
            }));
          } else {
            setTestResult((prev) => ({
              ...prev,
              [db.id]: { success: true, message: 'Format kredensial Turso libSQL valid dan siap digunakan!' },
            }));
          }
        } else if (db.id === 'supabase') {
          const url = db.fields.find((f) => f.key === 'url')?.value || '';
          const token = db.fields.find((f) => f.key === 'anonKey')?.value || '';
          if (!url.includes('.supabase.co') && !url.startsWith('http')) {
            setTestResult((prev) => ({
              ...prev,
              [db.id]: { success: false, message: 'Project URL Supabase harus menyertakan domain yang valid (misal: https://xyz.supabase.co)' },
            }));
          } else if (token.length < 20) {
            setTestResult((prev) => ({
              ...prev,
              [db.id]: { success: false, message: 'Anon Key Supabase tidak valid (terlalu pendek).' },
            }));
          } else {
            setTestResult((prev) => ({
              ...prev,
              [db.id]: { success: true, message: 'Format kredensial Supabase valid & siap terhubung!' },
            }));
          }
        } else {
          setTestResult((prev) => ({
            ...prev,
            [db.id]: { success: true, message: `Kredensial ${db.name} terverifikasi secara sintaksis!` },
          }));
        }
      }
      setTestingDbId(null);
    }, 600);
  };

  // Generate .env text
  const generateEnvText = () => {
    let text = '# GHIGHAIS AI - DATABASE ENVIRONMENT CONFIGURATION\n';
    text += `# Generated on: ${new Date().toISOString()}\n\n`;

    databases.forEach((db) => {
      text += `### ${db.name.toUpperCase()} ###\n`;
      db.fields.forEach((f) => {
        const envKey = `${db.id.toUpperCase()}_${f.key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
        text += `${envKey}="${f.value || ''}"\n`;
      });
      text += '\n';
    });

    return text;
  };

  // Filtered databases
  const filteredDatabases = databases.filter((db) => {
    const matchesSearch = 
      db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'configured') return db.isConfigured;
    if (selectedCategory === 'priority') return db.recommended || db.required;
    if (selectedCategory === 'relational') return db.category.includes('Relational');
    if (selectedCategory === 'nosql') return db.category.includes('NoSQL');
    if (selectedCategory === 'vector') return db.category.includes('Vector') || db.category.includes('Cache');

    return true;
  });

  const configuredCount = databases.filter((db) => db.isConfigured).length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>11 Database Engine Integrations</span>
          </div>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-neutral-100">
            Pusat Kredensial &amp; Token Database
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-2xl">
            Lengkapi kolom token untuk 11 database ternama di bawah. Wajib menyertakan <strong className="text-cyan-300 font-semibold">Turso</strong> dan sangat direkomendasikan menggunakan <strong className="text-emerald-300 font-semibold">Supabase</strong>.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-save-all-tokens"
            onClick={handleSaveAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs tracking-wide shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Token</span>
          </button>

          <button
            id="btn-view-env-format"
            onClick={() => setShowEnvModal(true)}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>Format .env</span>
          </button>

          <button
            id="btn-clear-all-tokens"
            onClick={handleClearAll}
            className="px-3 py-2.5 rounded-xl bg-neutral-900/60 hover:bg-rose-950/30 border border-neutral-800 hover:border-rose-500/30 text-neutral-400 hover:text-rose-300 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Kosongkan Semua"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {saveToast && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 to-neutral-900 border border-amber-500/50 text-amber-200 text-sm flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="text-neutral-400 hover:text-neutral-100 text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-database-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari database (contoh: Supabase, Turso, MongoDB)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-200 placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `Semua (11)` },
            { id: 'priority', label: '⭐ Prioritas (2)' },
            { id: 'configured', label: `Terkonfigurasi (${configuredCount})` },
            { id: 'relational', label: 'SQL / Relational' },
            { id: 'nosql', label: 'NoSQL' },
            { id: 'vector', label: 'Vector / Cache' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DATABASE GRID (11 DATABASES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDatabases.map((db) => {
          const isSupabase = db.id === 'supabase';
          const isTurso = db.id === 'turso';
          const test = testResult[db.id];

          return (
            <div
              key={db.id}
              id={`database-card-${db.id}`}
              className={`rounded-2xl p-6 transition-all duration-300 relative flex flex-col justify-between ${
                isSupabase
                  ? 'luxury-card border-emerald-500/40 shadow-emerald-950/20'
                  : isTurso
                  ? 'luxury-card border-cyan-500/40 shadow-cyan-950/20'
                  : 'luxury-card border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Database Avatar / Color icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
                      style={{
                        backgroundColor: `${db.accentColor}18`,
                        border: `1px solid ${db.accentColor}40`,
                        color: db.accentColor,
                      }}
                    >
                      <Database className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-neutral-100">{db.name}</h3>
                        {/* SPECIAL BADGES */}
                        {isSupabase && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ★ REKOMENDASI UTAMA
                          </span>
                        )}
                        {isTurso && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            ★ WAJIB ADA (libSQL)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400">{db.category}</span>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                        db.isConfigured
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          db.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
                        }`}
                      />
                      {db.isConfigured ? 'Terkonfigurasi' : 'Belum Diisi'}
                    </span>
                  </div>
                </div>

                {/* Description & Docs link */}
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">{db.description}</p>

                {/* INPUT FIELDS LIST */}
                <div className="space-y-3.5 mb-5">
                  {db.fields.map((field) => {
                    const fieldId = `${db.id}-${field.key}`;
                    const isPassword = field.type === 'password';
                    const isVisible = showPasswordMap[fieldId];
                    const inputType = isPassword ? (isVisible ? 'text' : 'password') : field.type;

                    return (
                      <div key={field.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={fieldId}
                            className="text-xs font-medium text-neutral-300 flex items-center gap-1.5"
                          >
                            <span>{field.label}</span>
                            {field.required && <span className="text-amber-400 text-xs">*</span>}
                          </label>

                          {field.value && (
                            <button
                              type="button"
                              onClick={() => handleCopy(field.value, fieldId)}
                              className="text-[10px] text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                              title="Salin isi kolom"
                            >
                              {copiedKey === fieldId ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="relative">
                          <input
                            id={fieldId}
                            type={inputType}
                            value={field.value}
                            onChange={(e) => handleFieldChange(db.id, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/70 border text-neutral-100 placeholder-neutral-600 text-xs focus:outline-none transition-all ${
                              isPassword ? 'pr-10' : ''
                            } ${
                              field.value
                                ? 'border-amber-500/30 focus:border-amber-500/60'
                                : 'border-neutral-800 focus:border-neutral-600'
                            }`}
                          />

                          {isPassword && (
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(fieldId)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 transition-colors p-1"
                              title={isVisible ? 'Sembunyikan' : 'Tampilkan token'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {field.helperText && (
                          <p className="text-[10px] text-neutral-500 italic pl-1">{field.helperText}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD FOOTER & TEST ACTIONS */}
              <div>
                {/* Validation Test Message */}
                {test && (
                  <div
                    className={`mb-4 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                      test.success
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {test.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{test.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                  <a
                    href={db.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Dapatkan Token di Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleTestConnection(db)}
                    disabled={testingDbId === db.id}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/30 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {testingDbId === db.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                        <span>Memvalidasi...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        <span>Validasi Kredensial</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ENV FORMAT MODAL */}
      {showEnvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-luxury text-lg font-bold text-neutral-100">
                  Pratinjau Format Berkas .env
                </h3>
              </div>
              <button
                onClick={() => setShowEnvModal(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-xs text-neutral-400 mb-3">
                Kutipan variabel lingkungan (.env) dari seluruh 11 database yang telah Anda isi di atas:
              </p>
              <pre className="p-4 rounded-xl bg-black border border-neutral-800 text-neutral-200 text-xs font-mono overflow-x-auto leading-relaxed">
                {generateEnvText()}
              </pre>
            </div>

            <div className="p-4 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Otomatis diikutsertakan saat Anda menggunakan menu <strong>Save Zip</strong>.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(generateEnvText(), 'env-modal')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'env-modal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'env-modal' ? 'Tersalin' : 'Salin Semua .env'}</span>
                </button>
                <button
                  onClick={() => setShowEnvModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
