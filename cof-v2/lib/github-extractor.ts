export interface Contributor {
  name: string;
  cardano_address: string;
  percentage: number;
  email?: string;
  orcid?: string;
  [key: string]: any;
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

export interface RepositoryContent {
  readme?: string;
  dependencies: string[];
}

interface FileInfo {
  name: string;
  path: string;
  url?: string;
  type?: string;
  content?: string;
}

async function extractReadmeContent(files: FileInfo[], repoUrl: string, token?: string): Promise<string | null> {
  const readmeFiles = files.filter(file => 
    file.name.toLowerCase().startsWith('readme') && 
    (file.name.toLowerCase().endsWith('.md') || 
     file.name.toLowerCase().endsWith('.txt') || 
     file.name.toLowerCase() === 'readme')
  );

  for (const file of readmeFiles) {
    try {
      const platform = getPlatformFromUrl(repoUrl);
      let content: string | null = null;

      if (platform === 'github' && file.url) {
        content = await fetchGitHubFileContent(file.url, token);
      } else if (platform === 'gitlab') {
        content = await fetchGitLabFileContent(repoUrl, file.path, token);
      }

      if (content) {
        return content;
      }
    } catch (error) {
      console.error(`Error fetching README ${file.name}:`, error);
    }
  }
  
  return null;
}

const VALID_DEPENDENCY_NAMES = new Set([
  "requirements.txt", "pipfile", "pyproject.toml", "setup.py", "gemfile",
  "package.json", "pom.xml", "build.gradle", "go.mod", "composer.json",
  "cargo.toml", "vcpkg.json", "conanfile.txt", "cmakelists.txt", "spack.yaml",
  ".csproj", "packages.config", "package.swift", "podfile", "pubspec.yaml",
  "description", "mix.exs", "install.sh", "bootstrap.sh", "cpanfile",
  "makefile.pl", "build.pl", "stack.yaml", "cabal.project", "rebar.config",
  "project.toml", "manifest.toml", "build.sbt", ".gemspec", ".npmrc", ".yarnrc",
  ".python-version", "bower.json", ".bowerrc", ".ruby-version", ".nvmrc",
  ".tool-versions", "shard.yml", "deno.json", "deno.jsonc", "tsconfig.json",
  "lerna.json", "gradle.properties", "build.boot", "Cartfile", "Cartfile.resolved",
  "Packages.swift", "default.nix", "WORKSPACE", "BUILD.bazel", "yarn.lock",
  "package-lock.json", "poetry.lock"
]);

async function extractDependencies(files: FileInfo[], repoUrl: string, token?: string): Promise<string[]> {
  const dependencies: string[] = [];
  
  for (const file of files) {
    if (VALID_DEPENDENCY_NAMES.has(file.name.toLowerCase())) {
      try {
        const platform = getPlatformFromUrl(repoUrl);
        let content: string | null = null;

        if (platform === 'github' && file.url) {
          content = await fetchGitHubFileContent(file.url, token);
        } else if (platform === 'gitlab') {
          content = await fetchGitLabFileContent(repoUrl, file.path, token);
        }

        if (content) {
          dependencies.push(`${file.name}:\n${content}`);
        }
      } catch (error) {
        console.error(`Error fetching dependency file ${file.name}:`, error);
      }
    }
  }
  
  return dependencies;
}

async function fetchGitLabFileContent(repoUrl: string, filePath: string, token?: string): Promise<string | null> {
  try {
    const projectId = await extractGitLabProjectId(repoUrl, token);
    if (!projectId) return null;

    const apiBase = new URL(repoUrl).origin + '/api/v4';
    const encodedPath = encodeURIComponent(filePath);
    const rawUrl = `${apiBase}/projects/${encodeURIComponent(projectId)}/repository/files/${encodedPath}/raw`;
    
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(rawUrl, { headers });
    if (response.ok) {
      const content = await response.text();
      return formatFileContent(filePath, content);
    }
  } catch (error) {
    console.error(`Error fetching GitLab file ${filePath}:`, error);
  }
  return null;
}

export async function extractRepositoryContent(repoUrl: string, token?: string): Promise<RepositoryContent> {
  const platform = getPlatformFromUrl(repoUrl);
  if (!platform) {
    throw new Error('Unsupported repository platform');
  }

  let files: FileInfo[] = [];

  if (platform === 'github') {
    files = await fetchGitHubFiles(repoUrl, token);
  } else if (platform === 'gitlab') {
    files = await fetchGitLabFiles(repoUrl, token);
  }

  const [readme, dependencies] = await Promise.all([
    extractReadmeContent(files, repoUrl, token),
    extractDependencies(files, repoUrl, token)
  ]);

  return {
    readme: readme || undefined,
    dependencies
  };
}

async function fetchGitHubFiles(repoUrl: string, token?: string): Promise<FileInfo[]> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return [];

  const [_, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const res = await fetch(apiUrl, { headers });
    if (!res.ok) return [];

    const contents = await res.json();
    const files = Array.isArray(contents) ? contents : [];

    return files.map(file => ({
      name: file.name,
      path: file.path,
      url: file.url,
      type: file.type
    }));
  } catch (error) {
    console.error('Error fetching GitHub files:', error);
    return [];
  }
}

async function fetchGitLabFiles(repoUrl: string, token?: string): Promise<FileInfo[]> {
  try {
    const projectId = await extractGitLabProjectId(repoUrl, token);
    if (!projectId) return [];

    const apiBase = new URL(repoUrl).origin + '/api/v4';
    const treeUrl = `${apiBase}/projects/${encodeURIComponent(projectId)}/repository/tree`;

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(treeUrl, { headers });
    if (!res.ok) return [];

    const files = await res.json();
    return files.map((file: any) => ({
      name: file.name,
      path: file.path,
      type: file.type
    }));
  } catch (error) {
    console.error('Error fetching GitLab files:', error);
    return [];
  }
}

export async function fetchDependenciesFromBackend(repoUrl: string, token?: string): Promise<any> {
  try {
    const repoContent = await extractRepositoryContent(repoUrl, token);
    
    let content = '';
    
    if (repoContent.readme) {
      content += repoContent.readme + '\n\n';
    }
    
    if (repoContent.dependencies.length > 0) {
      content += repoContent.dependencies.join('\n\n');
    }

    console.log('Using API proxy endpoint');
    console.log('Content:', content);
    
    const llmResponse = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: content,
        model: 'metadata-extractor',
      }),
    });

    if (!llmResponse.ok) {
      const errorData = await llmResponse.text();
      console.error('LLM API error:', errorData);
      throw new Error(`LLM API request failed with status ${llmResponse.status}: ${errorData}`);
    }

    const llmResult = await llmResponse.json();
    console.log('LLM API response:', llmResult);
    return llmResult.response;
  } catch (error) {
    console.error('Error fetching dependencies from backend:', error);
    throw error;
  }
}
