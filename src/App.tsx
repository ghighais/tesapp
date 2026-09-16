import React, { useState, useEffect } from 'react';
import { ActiveTab, DatabaseItem, GitHubUser, GitHubRepo, AppPage } from './types';
import { INITIAL_DATABASES } from './data/databases';
import { DEFAULT_TEMPLATE_PAGES } from './data/defaultTemplatePages';
import { Header } from './components/Header';
import { BerandaView } from './components/BerandaView';
import { DatabaseView } from './components/DatabaseView';
import { GitHubView } from './components/GitHubView';
import { SaveZipView } from './components/SaveZipView';
import { LoggedOutView } from './components/LoggedOutView';
import { Sparkles, Shield, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');

  // Session & persistence state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ghighais_session_status') !== 'logged_out';
  });
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    return localStorage.getItem('ghighais_last_saved_time') || null;
  });
  const userEmail = 'bantuf9@gmail.com';

  // 1. Database state with local storage persistence
  const [databases, setDatabases] = useState<DatabaseItem[]>(() => {
    const saved = localStorage.getItem('ghighais_databases_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial definitions so new fields are kept intact
        return INITIAL_DATABASES.map((initialDb) => {
          const matched = parsed.find((p: any) => p.id === initialDb.id);
          if (matched) {
            return {
              ...initialDb,
              isConfigured: matched.isConfigured,
              fields: initialDb.fields.map((f) => {
                const matchedField = matched.fields?.find((mf: any) => mf.key === f.key);
                return matchedField ? { ...f, value: matchedField.value || '' } : f;
              }),
            };
          }
          return initialDb;
        });
      } catch (e) {
        console.error('Error parsing stored database configurations', e);
      }
    }
    return INITIAL_DATABASES;
  });

  // 2. GitHub state with local storage persistence
  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('ghighais_github_token') || '';
  });
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  // Automatically attempt to fetch GitHub user and repos if token already exists in localStorage on startup
  useEffect(() => {
    if (githubToken && !currentUser) {
      const fetchInitialGitHub = async () => {
        try {
          const userRes = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });
          if (userRes.ok) {
            const userData: GitHubUser = await userRes.json();
            setCurrentUser(userData);

            const repoRes = await fetch(
              'https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator',
              {
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: 'application/vnd.github.v3+json',
                },
              }
            );
            if (repoRes.ok) {
              const repoData: GitHubRepo[] = await repoRes.json();
              setRepos(repoData);
            }
          }
        } catch (err) {
          console.warn('Initial GitHub auto-fetch failed:', err);
        }
      };
      fetchInitialGitHub();
    }
  }, [githubToken, currentUser]);

  // Handler for database updates
  const handleUpdateDatabases = (updated: DatabaseItem[]) => {
    setDatabases(updated);
    localStorage.setItem('ghighais_databases_config', JSON.stringify(updated));
  };

  const getSavedPages = (): AppPage[] => {
    const saved = localStorage.getItem('ghighais_studio_pages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TEMPLATE_PAGES;
  };

  const handleLogout = () => {
    const now = new Date().toISOString();
    setLastSavedTime(now);
    localStorage.setItem('ghighais_last_saved_time', now);
    localStorage.setItem('ghighais_session_status', 'logged_out');
    setIsLoggedIn(false);
  };

  const handleResume = () => {
    localStorage.setItem('ghighais_session_status', 'active');
    setIsLoggedIn(true);
  };

  const configuredDbCount = databases.filter((db) => db.isConfigured).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* HEADER COMPONENT (Logo, App Name, Menu: Beranda, Database, Push GitHub, Save Zip, Logout) */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        configuredDbCount={configuredDbCount}
        githubConnected={!!currentUser}
        githubUsername={currentUser?.login || null}
        userEmail={userEmail}
        onLogout={isLoggedIn ? handleLogout : undefined}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {!isLoggedIn ? (
          <LoggedOutView
            userEmail={userEmail}
            pages={getSavedPages()}
            databases={databases}
            lastSavedTime={lastSavedTime}
            onResume={handleResume}
          />
        ) : (
          <>
            {activeTab === 'beranda' && (
              <BerandaView
                onNavigate={setActiveTab}
                databases={databases}
                githubConnected={!!currentUser}
                githubUsername={currentUser?.login || null}
                repoCount={repos.length}
                githubToken={githubToken}
              />
            )}

            {activeTab === 'database' && (
              <DatabaseView
                databases={databases}
                onUpdateDatabases={handleUpdateDatabases}
              />
            )}

            {activeTab === 'github' && (
              <GitHubView
                githubToken={githubToken}
                onUpdateToken={(token) => setGithubToken(token)}
                currentUser={currentUser}
                onUpdateUser={setCurrentUser}
                repos={repos}
                onUpdateRepos={setRepos}
                databases={databases}
              />
            )}

            {activeTab === 'zip' && (
              <SaveZipView
                databases={databases}
                currentUser={currentUser}
                repos={repos}
              />
            )}
          </>
        )}
      </main>

      {/* LUXURY FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 backdrop-blur-md py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-luxury font-bold text-amber-400">GHIGHAIS AI</span>
            <span>— Architecture &amp; Repository Luxe Suite</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Token Aman di Klien</span>
            </span>
            <span className="flex items-center gap-1 text-neutral-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>11 Database &amp; GitHub Sync</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
