import { GitHubUrlContent } from '../types';

/**
 * Parses any GitHub URL into owner, repo, branch, path, and target type
 */
export function parseGitHubUrl(rawUrl: string): {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
  isBlob?: boolean;
} | null {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    // Handle raw.githubusercontent.com
    if (trimmed.includes('raw.githubusercontent.com')) {
      const parts = trimmed.replace('https://raw.githubusercontent.com/', '').split('/');
      if (parts.length >= 3) {
        const owner = parts[0];
        const repo = parts[1];
        const branch = parts[2];
        const path = parts.slice(3).join('/');
        return { owner, repo, branch, path, isBlob: true };
      }
    }

    // Standard github.com
    const clean = trimmed.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
    const parts = clean.split('/');
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');

    if (parts.length === 2) {
      return { owner, repo };
    }

    // blob or tree
    if (parts[2] === 'blob' || parts[2] === 'tree') {
      const isBlob = parts[2] === 'blob';
      const branch = parts[3];
      const path = parts.slice(4).join('/');
      return { owner, repo, branch, path, isBlob };
    }

    return { owner, repo };
  } catch (err) {
    console.error('Error parsing GitHub URL', err);
    return null;
  }
}

/**
 * Fetches repository content, file tree, or single file content from GitHub
 */
export async function fetchGitHubUrlContent(
  rawUrl: string,
  githubToken?: string
): Promise<GitHubUrlContent> {
  const parsed = parseGitHubUrl(rawUrl);
  if (!parsed) {
    return {
      url: rawUrl,
      owner: '',
      repo: '',
      type: 'repo',
      error: 'Format URL GitHub tidak valid. Contoh valid: https://github.com/owner/repo atau https://github.com/owner/repo/blob/main/index.html'
    };
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`;
  }

  try {
    // 1. Fetch Repo info
    const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers,
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return {
          url: rawUrl,
          owner: parsed.owner,
          repo: parsed.repo,
          type: 'repo',
          error: `Repositori "${parsed.owner}/${parsed.repo}" tidak ditemukan atau bersifat privat (perlu token GitHub).`
        };
      }
      if (repoRes.status === 403) {
        return {
          url: rawUrl,
          owner: parsed.owner,
          repo: parsed.repo,
          type: 'repo',
          error: 'Batas kuota GitHub API tercapai. Masukkan Personal Access Token Anda di menu GitHub untuk akses tanpa batas.'
        };
      }
      return {
        url: rawUrl,
        owner: parsed.owner,
        repo: parsed.repo,
        type: 'repo',
        error: `Gagal mengakses GitHub (${repoRes.status}: ${repoRes.statusText})`
      };
    }

    const repoJson = await repoRes.json();
    const repoInfo = {
      name: repoJson.name,
      fullName: repoJson.full_name,
      description: repoJson.description || 'Tidak ada deskripsi repositori',
      stars: repoJson.stargazers_count,
      forks: repoJson.forks_count,
      defaultBranch: repoJson.default_branch || 'main',
      language: repoJson.language,
    };

    // 2. If single file (blob) requested
    if (parsed.isBlob && parsed.path) {
      const fileRes = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.path}?ref=${parsed.branch || repoInfo.defaultBranch}`,
        { headers }
      );

      if (fileRes.ok) {
        const fileJson = await fileRes.json();
        let content = '';
        if (fileJson.encoding === 'base64' && fileJson.content) {
          try {
            content = decodeURIComponent(escape(atob(fileJson.content.replace(/\s/g, ''))));
          } catch {
            content = atob(fileJson.content.replace(/\s/g, ''));
          }
        } else if (fileJson.download_url) {
          const rawFetch = await fetch(fileJson.download_url);
          content = await rawFetch.text();
        }

        return {
          url: rawUrl,
          owner: parsed.owner,
          repo: parsed.repo,
          path: parsed.path,
          type: 'file',
          repoInfo,
          fileName: fileJson.name,
          fileContent: content,
        };
      }
    }

    // 3. Directory or root repo contents
    const targetPath = parsed.path || '';
    const contentsRes = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${targetPath}?ref=${parsed.branch || repoInfo.defaultBranch}`,
      { headers }
    );

    let files: Array<{ name: string; path: string; type: 'file' | 'dir'; download_url?: string; size?: number }> = [];
    let readmeText = '';

    if (contentsRes.ok) {
      const contentsJson = await contentsRes.json();
      if (Array.isArray(contentsJson)) {
        files = contentsJson.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type === 'dir' ? 'dir' : 'file',
          download_url: item.download_url,
          size: item.size,
        }));
      }
    }

    // Try to fetch README if at root
    if (!targetPath) {
      try {
        const readmeRes = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`,
          { headers }
        );
        if (readmeRes.ok) {
          const readmeJson = await readmeRes.json();
          if (readmeJson.content) {
            readmeText = decodeURIComponent(escape(atob(readmeJson.content.replace(/\s/g, ''))));
          }
        }
      } catch {
        // ignore readme error
      }
    }

    return {
      url: rawUrl,
      owner: parsed.owner,
      repo: parsed.repo,
      path: targetPath,
      type: 'repo',
      repoInfo,
      files,
      fileContent: readmeText || undefined,
      fileName: readmeText ? 'README.md' : undefined,
    };
  } catch (err: any) {
    return {
      url: rawUrl,
      owner: parsed.owner,
      repo: parsed.repo,
      type: 'repo',
      error: `Koneksi ke GitHub gagal: ${err.message || 'Periksa koneksi internet'}`
    };
  }
}
