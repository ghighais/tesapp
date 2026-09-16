export type ActiveTab = 'beranda' | 'database' | 'github' | 'zip';

export interface DatabaseField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'url';
  required?: boolean;
  value: string;
  helperText?: string;
}

export interface DatabaseItem {
  id: string;
  name: string;
  category: 'Relational / SQL' | 'NoSQL / Document' | 'Vector DB' | 'Key-Value / Cache';
  recommended?: boolean;
  required?: boolean;
  tagline: string;
  description: string;
  badge: string;
  accentColor: string;
  glowColor: string;
  docsUrl: string;
  fields: DatabaseField[];
  isConfigured: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  total_private_repos?: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

export interface ZipExportFile {
  name: string;
  path: string;
  description: string;
  content: string;
  category: 'config' | 'doc' | 'code' | 'schema';
  sizeFormatted: string;
  selected: boolean;
}

// Studio Multi-Page File System
export interface AppPage {
  id: string;
  name: string; // e.g. "index.html", "about.html", "services.html", "contact.html", "styles.css", "app.js"
  title: string; // e.g. "Beranda", "Tentang Kami", "Layanan", "Kontak"
  content: string;
  type: 'html' | 'css' | 'js';
  isDefault?: boolean;
}

// Visual Element Editor Styles & Coordinates
export interface VisualElementStyles {
  width?: string;
  height?: string;
  padding?: string;
  fontSize?: string;
  borderRadius?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  transformX: number;
  transformY: number;
  opacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  display?: string;
}

export interface VisualElementEdit {
  selector: string;
  tagName: string;
  id?: string;
  className?: string;
  innerText: string;
  styles: VisualElementStyles;
}

// GitHub URL Content Inspection
export interface GitHubUrlContent {
  url: string;
  owner: string;
  repo: string;
  path?: string;
  type: 'repo' | 'file' | 'dir';
  repoInfo?: {
    name: string;
    fullName: string;
    description: string | null;
    stars: number;
    forks: number;
    defaultBranch: string;
    language: string | null;
  };
  files?: Array<{
    name: string;
    path: string;
    type: 'file' | 'dir';
    download_url?: string;
    size?: number;
  }>;
  fileContent?: string;
  fileName?: string;
  error?: string;
}
