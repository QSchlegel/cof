// GitHub/GitLab repository contributor extraction utilities

export interface Contributor {
  name: string;
  cardano_address: string;
  percentage: number;
  email?: string;
  orcid?: string;
  [key: string]: any; // Allow any additional dynamic fields
}

const CONTRIBUTORS_FILES = new Set([
  "contributors.txt", 
  "CONTRIBUTORS.txt"
]);

function formatJsonContent(content: string): string {
  try {
    const parsedJson = JSON.parse(content);
    return JSON.stringify(parsedJson, null, 0);
  } catch (error) {
    let normalizedContent = content.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ');
    while (normalizedContent.includes('  ')) {
      normalizedContent = normalizedContent.replace(/  /g, ' ');
    }
    return normalizedContent.trim();
  }
}

function formatFileContent(fileName: string, content: string): string {
  const fileNameLower = fileName.toLowerCase();
  
  if (fileNameLower.endsWith('.json') || fileNameLower.endsWith('.txt')) {
    return content.trim();
  }
  
  return content.replace(/\s+/g, ' ').trim();
}

async function fetchGitHubFileContent(url: string, token?: string): Promise<string | null> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  
  try {
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    if (data.encoding === 'base64') {
      const buff = Buffer.from(data.content, 'base64');
      const rawContent = buff.toString('utf-8');
      const fileName = url.split('/').pop() || '';
      const formattedContent = formatFileContent(fileName, rawContent);
      return formattedContent;
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

export async function extractGitHubContributors(repoUrl: string, token?: string): Promise<Contributor[]> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub repository URL.');

  const [_, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  const res = await fetch(apiUrl, { headers });

  if (!res.ok) {
    throw new Error(`Failed to fetch contents for ${owner}/${repo}`);
  }

  const contents = await res.json();
  const files = Array.isArray(contents) ? contents : [];

  for (const file of files) {
    const name = file.name;
    
    if (CONTRIBUTORS_FILES.has(name)) {
      const content = await fetchGitHubFileContent(file.url, token);
      if (content) {
        try {
          const contributors = JSON.parse(content);
          if (Array.isArray(contributors)) {
            return contributors;
          }
        } catch (error) {
          console.error('Error parsing contributors file:', error);
        }
      }
    }
  }

  return [];
}

async function extractGitLabProjectId(repoUrl: string, token?: string): Promise<string | null> {
  const url = new URL(repoUrl);
  const apiBase = url.origin + '/api/v4';
  const pathname = url.pathname.replace(/^\//, '').replace(/\.git$/, '');
  
  const headers: HeadersInit = {
    'Accept': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const encodedPath = encodeURIComponent(pathname);
    const projectApiUrl = `${apiBase}/projects/${encodedPath}`;
    
    const res = await fetch(projectApiUrl, { headers });
    
    if (res.ok) {
      const project = await res.json();
      return project.id.toString();
    } else {
      return encodedPath;
    }
  } catch (e) {
    const encodedPath = encodeURIComponent(pathname);
    return encodedPath;
  }
}

export async function extractGitLabContributors(repoUrl: string, token?: string): Promise<Contributor[]> {
  const projectId = await extractGitLabProjectId(repoUrl, token);
  if (!projectId) throw new Error('Could not extract GitLab project ID.');

  const apiBase = new URL(repoUrl).origin + '/api/v4';
  const treeUrl = `${apiBase}/projects/${encodeURIComponent(projectId)}/repository/tree`;

  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const treeRes = await fetch(treeUrl, { headers });

  if (!treeRes.ok) throw new Error('Failed to fetch GitLab repo tree');

  const files = await treeRes.json();

  for (const file of files) {
    const name = file.name;
    
    if (CONTRIBUTORS_FILES.has(name)) {
      const encodedPath = encodeURIComponent(file.path);
      const rawUrl = `${apiBase}/projects/${encodeURIComponent(projectId)}/repository/files/${encodedPath}/raw`;
      
      const contentRes = await fetch(rawUrl, { headers });

      if (contentRes.ok) {
        const rawText = await contentRes.text();
        const formattedText = formatFileContent(name, rawText);
        
        try {
          const contributors = JSON.parse(formattedText);
          if (Array.isArray(contributors)) {
            return contributors;
          }
        } catch (error) {
          console.error('Error parsing contributors file:', error);
        }
      }
    }
  }

  return [];
}

export function validateRepoUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+\/?$/;
  const gitlabRegex = /^https:\/\/[\w.-]+\/[\w.-]+(\/[\w.-]+)*\/?(?:\.git)?$/;
  
  return githubRegex.test(url) || gitlabRegex.test(url);
}

export function getPlatformFromUrl(url: string): 'github' | 'gitlab' | null {
  if (!url) return null;
  if (url.includes('github.com')) return 'github';
  
  const gitlabRegex = /^https:\/\/[\w.-]+\/[\w.-]+(\/[\w.-]+)*\/?(?:\.git)?$/;
  if (gitlabRegex.test(url) && !url.includes('github.com')) {
    return 'gitlab';
  }
  
  return null;
}
