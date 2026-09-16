import React, { useState, useEffect } from 'react';
import { 
  Github, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Search, 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Star, 
  GitFork, 
  Lock, 
  Globe, 
  UploadCloud, 
  RefreshCw, 
  UserCheck, 
  LogOut,
  FolderGit2,
  FileCode2,
  Sparkles
} from 'lucide-react';
import { GitHubUser, GitHubRepo, DatabaseItem } from '../types';

interface GitHubViewProps {
  githubToken: string;
  onUpdateToken: (token: string) => void;
  currentUser: GitHubUser | null;
  onUpdateUser: (user: GitHubUser | null) => void;
  repos: GitHubRepo[];
  onUpdateRepos: (repos: GitHubRepo[]) => void;
  databases: DatabaseItem[];
}

export const GitHubView: React.FC<GitHubViewProps> = ({
  githubToken,
  onUpdateToken,
  currentUser,
  onUpdateUser,
  repos,
  onUpdateRepos,
  databases,
}) => {
  const [inputToken, setInputToken] = useState(githubToken);
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchRepoQuery, setSearchRepoQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');

  // Push commit form state
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
  const [targetBranch, setTargetBranch] = useState<string>('main');
  const [targetFilePath, setTargetFilePath] = useState<string>('ghighais-ai-manifest.json');
  const [commitMessage, setCommitMessage] = useState<string>('feat: sinkronisasi arsitektur GHIGHAIS AI');
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; url?: string; message: string } | null>(null);

  // Sync token state if prop changes
  useEffect(() => {
    setInputToken(githubToken);
  }, [githubToken]);

  // Set default selected repo when repos load
  useEffect(() => {
    if (repos.length > 0 && !selectedRepoFullName) {
      setSelectedRepoFullName(repos[0].full_name);
      setTargetBranch(repos[0].default_branch || 'main');
    }
  }, [repos, selectedRepoFullName]);

  // Connect & Fetch GitHub Account and Repos
  const handleConnect = async (tokenToUse?: string) => {
    const token = (tokenToUse !== undefined ? tokenToUse : inputToken).trim();
    if (!token) {
      setErrorMessage('Token GitHub wajib diisi. Masukkan Personal Access Token (PAT) Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Fetch User Profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userRes.ok) {
        if (userRes.status === 401) {
          throw new Error('Token GitHub tidak valid atau telah kedaluwarsa (401 Unauthorized).');
        } else if (userRes.status === 403) {
          throw new Error('Akses ditolak atau limit rate API tercapai. Pastikan token memiliki hak akses.');
        } else {
          throw new Error(`Gagal menghubungi GitHub API (Status: ${userRes.status}).`);
        }
      }

      const userData: GitHubUser = await userRes.json();
      onUpdateUser(userData);
      onUpdateToken(token);
      localStorage.setItem('ghighais_github_token', token);

      // 2. Fetch User Repositories
      const repoRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (repoRes.ok) {
        const repoData: GitHubRepo[] = await repoRes.json();
        onUpdateRepos(repoData);
        if (repoData.length > 0) {
          setSelectedRepoFullName(repoData[0].full_name);
          setTargetBranch(repoData[0].default_branch || 'main');
        }
        setSuccessMessage(`Akun @${userData.login} berhasil terhubung! Menampilkan ${repoData.length} repositori.`);
      } else {
        onUpdateRepos([]);
        setSuccessMessage(`Akun @${userData.login} terhubung.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memverifikasi token GitHub.');
      onUpdateUser(null);
      onUpdateRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect GitHub Account
  const handleDisconnect = () => {
    onUpdateToken('');
    onUpdateUser(null);
    onUpdateRepos([]);
    setInputToken('');
    localStorage.removeItem('ghighais_github_token');
    setSuccessMessage('Koneksi akun GitHub telah diputus.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle Push File to GitHub Repo
  const handlePushCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken || !currentUser) {
      setErrorMessage('Harap hubungkan akun GitHub terlebih dahulu.');
      return;
    }

    if (!selectedRepoFullName) {
      setErrorMessage('Pilih repositori tujuan push terlebih dahulu.');
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const [owner, repo] = selectedRepoFullName.split('/');
      const cleanPath = targetFilePath.startsWith('/') ? targetFilePath.slice(1) : targetFilePath;

      // Prepare payload: bundle of GHIGHAIS AI manifest & current configured databases
      const manifestPayload = {
        app: 'GHIGHAIS AI Luxe Suite',
        exportedAt: new Date().toISOString(),
        author: currentUser.login,
        branch: targetBranch,
        databaseIntegrations: databases
          .filter((d) => d.isConfigured)
          .map((d) => ({
            id: d.id,
            name: d.name,
            category: d.category,
            configuredFields: d.fields.map((f) => ({
              key: f.key,
              label: f.label,
              // mask actual secret values for safety in repository commit unless user explicitly wishes
              maskedValue: f.type === 'password' ? '***ENCRYPTED_TOKEN***' : f.value,
            })),
          })),
        notes: 'Generated via GHIGHAIS AI Push GitHub Module.',
      };

      const fileContentStr = JSON.stringify(manifestPayload, null, 2);
      // Encode string to UTF-8 base64
      const base64Content = btoa(unescape(encodeURIComponent(fileContentStr)));

      // Step 1: Check if file already exists to obtain SHA (required by GitHub for updates)
      let fileSha: string | undefined;
      const getFileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${targetBranch}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (getFileRes.ok) {
        const existingData = await getFileRes.json();
        fileSha = existingData.sha;
      }

      // Step 2: Create or update file
      const putBody: any = {
        message: commitMessage,
        content: base64Content,
        branch: targetBranch,
      };
      if (fileSha) {
        putBody.sha = fileSha;
      }

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(putBody),
      });

      if (!putRes.ok) {
        const errorJson = await putRes.json();
        throw new Error(errorJson.message || `Gagal melakukan push (Status: ${putRes.status})`);
      }

      const putData = await putRes.json();
      setPushResult({
        success: true,
        url: putData.content?.html_url || `https://github.com/${owner}/${repo}`,
        message: `Berhasil melakukan commit & push berkas "${cleanPath}" ke branch "${targetBranch}"!`,
      });
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err.message || 'Gagal melakukan push ke repositori GitHub.',
      });
    } finally {
      setIsPushing(false);
    }
  };

  // Filtered repositories
  const filteredRepos = repos.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchRepoQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchRepoQuery.toLowerCase())) ||
      (r.language && r.language.toLowerCase().includes(searchRepoQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterVisibility === 'public') return !r.private;
    if (filterVisibility === 'private') return r.private;
    return true;
  });

  return (
    <div className="space-y-10 pb-16">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Personal Token &amp; Repository Engine</span>
          </div>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-neutral-100">
            Push GitHub &amp; Manajemen Repositori
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-2xl">
            Wajib mengisi kolom token Personal Access Token (PAT). Sistem akan memuat profil pengguna dan menampilkan repositori sesuai dengan akun yang telah terhubung.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/30 text-neutral-400 hover:text-rose-300 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Putuskan Akun</span>
          </button>
        )}
      </div>

      {/* TOKEN INPUT FORM SECTION */}
      <section className="luxury-card rounded-2xl p-6 sm:p-8 border border-neutral-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100">
              GitHub Personal Access Token (Wajib)
            </h2>
            <p className="text-xs text-neutral-400">
              Token digunakan untuk membaca akun, daftar repositori, dan mengirimkan komitmen (Push).
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConnect();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="github-token-input" className="text-xs font-semibold text-neutral-300">
                Kolom Personal Access Token (Token PAT GitHub) <span className="text-amber-400">*</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>Buat Token di GitHub (Beri izin 'repo')</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                id="github-token-input"
                type={showToken ? 'text' : 'password'}
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx atau github_pat_..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 text-neutral-100 placeholder-neutral-600 text-xs font-mono focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 transition-colors p-1"
                title={showToken ? 'Sembunyikan' : 'Tampilkan token'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 italic">
              Contoh format token classic diawali dengan <code className="text-amber-400/90 font-mono">ghp_</code> atau fine-grained dengan <code className="text-amber-400/90 font-mono">github_pat_</code>.
            </p>
          </div>

          {/* ALERTS */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-connect-github-token"
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs tracking-wide shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Token GitHub...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>Hubungkan Akun &amp; Muat Repositori</span>
                </>
              )}
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => handleConnect()}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Daftar Repo</span>
              </button>
            )}
          </div>
        </form>
      </section>

      {/* CONNECTED USER PROFILE CARD */}
      {currentUser && (
        <section className="luxury-card rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/10 via-neutral-950 to-neutral-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.login}
                className="w-16 h-16 rounded-2xl border-2 border-amber-500/40 shadow-lg object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-neutral-100">
                    {currentUser.name || currentUser.login}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Terhubung</span>
                  </span>
                </div>
                <a
                  href={currentUser.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono mt-0.5"
                >
                  <span>@{currentUser.login}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {currentUser.bio && (
                  <p className="text-xs text-neutral-300 mt-1.5 line-clamp-2 max-w-lg">
                    {currentUser.bio}
                  </p>
                )}
              </div>
            </div>

            {/* User Stats Grid */}
            <div className="flex items-center gap-4 text-center border-t sm:border-t-0 sm:border-l border-neutral-800 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around sm:justify-start">
              <div className="px-2">
                <span className="block text-lg font-bold text-neutral-100">{currentUser.public_repos}</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Publik Repo</span>
              </div>
              {currentUser.total_private_repos !== undefined && (
                <div className="px-2">
                  <span className="block text-lg font-bold text-amber-300">{currentUser.total_private_repos}</span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Privat Repo</span>
                </div>
              )}
              <div className="px-2">
                <span className="block text-lg font-bold text-neutral-100">{currentUser.followers}</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Followers</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* REPOSITORY LIST SECTION */}
      {currentUser && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-luxury text-2xl font-bold text-neutral-100 flex items-center gap-2">
                <span>Repositori Akun @{currentUser.login}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {repos.length} Repositori
                </span>
              </h2>
              <p className="text-neutral-400 text-xs mt-1">
                Daftar repositori yang dapat diakses oleh token pengguna yang terhubung.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchRepoQuery}
                  onChange={(e) => setSearchRepoQuery(e.target.value)}
                  placeholder="Cari repositori..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-amber-500/40 w-44 sm:w-56"
                />
              </div>

              <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
                {(['all', 'public', 'private'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterVisibility(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-medium transition-all ${
                      filterVisibility === mode
                        ? 'bg-neutral-800 text-amber-300'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Repo Grid */}
          {filteredRepos.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-neutral-400 text-xs">
              Tidak ada repositori yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
              {filteredRepos.map((repo) => {
                const isSelected = selectedRepoFullName === repo.full_name;
                return (
                  <div
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepoFullName(repo.full_name);
                      setTargetBranch(repo.default_branch || 'main');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/30'
                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 truncate">
                          <FolderGit2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                          <span className="text-xs font-bold text-neutral-100 truncate">{repo.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {repo.private ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Private</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              <span>Public</span>
                            </span>
                          )}

                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-neutral-400 hover:text-amber-300 p-1"
                            title="Buka di GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-400 line-clamp-2 min-h-[32px]">
                        {repo.description || 'Tidak ada deskripsi pada repositori ini.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <span className="flex items-center gap-1 text-neutral-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>{repo.language}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>{repo.stargazers_count}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks_count}</span>
                        </span>
                      </div>

                      <span className="text-[10px] text-neutral-500 font-mono">
                        {repo.default_branch}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* PUSH COMMIT PANEL */}
      {currentUser && (
        <section className="luxury-card rounded-2xl p-6 sm:p-8 border border-amber-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100">
                Eksekusi Push Commit ke Repositori
              </h2>
              <p className="text-xs text-neutral-400">
                Kirimkan manifest arsitektur GHIGHAIS AI langsung ke repositori GitHub yang telah Anda pilih.
              </p>
            </div>
          </div>

          <form onSubmit={handlePushCommit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* TARGET REPO */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Repositori Terpilih <span className="text-amber-400">*</span>
                </label>
                <select
                  id="select-target-repo"
                  value={selectedRepoFullName}
                  onChange={(e) => {
                    setSelectedRepoFullName(e.target.value);
                    const found = repos.find((r) => r.full_name === e.target.value);
                    if (found) setTargetBranch(found.default_branch || 'main');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-amber-500/50"
                >
                  {repos.map((r) => (
                    <option key={r.id} value={r.full_name}>
                      {r.full_name} ({r.private ? 'Private' : 'Public'})
                    </option>
                  ))}
                </select>
              </div>

              {/* TARGET BRANCH */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Branch</span>
                </label>
                <input
                  type="text"
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* TARGET FILE PATH */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nama Berkas Tujuan</span>
                </label>
                <input
                  type="text"
                  value={targetFilePath}
                  onChange={(e) => setTargetFilePath(e.target.value)}
                  placeholder="ghighais-ai-manifest.json"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* COMMIT MESSAGE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-amber-400" />
                <span>Pesan Commit (Commit Message)</span>
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="feat: sinkronisasi arsitektur GHIGHAIS AI"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* PUSH RESULT FEEDBACK */}
            {pushResult && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                  pushResult.success
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                }`}
              >
                {pushResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{pushResult.message}</p>
                  {pushResult.url && (
                    <a
                      href={pushResult.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline mt-1 font-medium"
                    >
                      <span>Lihat file yang telah di-push di GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                id="btn-execute-push-commit"
                type="submit"
                disabled={isPushing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-neutral-950 font-bold text-xs tracking-wide shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Commit ke GitHub...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Eksekusi Push Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* NOT CONNECTED EMPTY STATE HELPER */}
      {!currentUser && (
        <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-800 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Github className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-200">
            Belum Terhubung dengan Akun GitHub
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Silakan masukkan Personal Access Token (PAT) Anda pada formulir di atas untuk memuat repositori dan mengaktifkan kemampuan push commit.
          </p>
        </div>
      )}

    </div>
  );
};
