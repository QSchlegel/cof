// GitHub/GitLab API integration utilities

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
}

const GITHUB_API_BASE = 'https://api.github.com';
const GITLAB_API_BASE = 'https://gitlab.com/api/v4';

export const searchGitHubRepositories = async (
  query: string,
  language?: string,
  sort = 'stars',
  order = 'desc',
  perPage = 30
): Promise<Repository[]> => {
  const params = new URLSearchParams({
    q: query + (language ? ` language:${language}` : ''),
    sort,
    order,
    per_page: perPage.toString(),
  });

  const response = await fetch(`${GITHUB_API_BASE}/search/repositories?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search GitHub repositories');
  }

  const data = await response.json();
  return data.items;
};

export const getGitHubRepository = async (owner: string, repo: string): Promise<Repository> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
  if (!response.ok) {
    throw new Error('Failed to fetch GitHub repository');
  }

  return response.json();
};

export const getRepositoryDependencies = async (owner: string, repo: string): Promise<string[]> => {
  try {
    // Try to fetch package.json
    const packageResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/package.json`);
    if (packageResponse.ok) {
      const packageData = await packageResponse.json();
      const packageJson = JSON.parse(atob(packageData.content));
      
      const dependencies = [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
      ];
      
      return dependencies;
    }

    // Try to fetch requirements.txt for Python projects
    const requirementsResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/requirements.txt`);
    if (requirementsResponse.ok) {
      const requirementsData = await requirementsResponse.json();
      const requirements = atob(requirementsData.content);
      
      return requirements
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('==')[0].split('>=')[0].split('<=')[0].trim());
    }

    // Try to fetch Cargo.toml for Rust projects
    const cargoResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/Cargo.toml`);
    if (cargoResponse.ok) {
      const cargoData = await cargoResponse.json();
      const cargoToml = atob(cargoData.content);
      
      // Basic parsing - in a real app, you'd use a proper TOML parser
      const dependencySection = cargoToml.split('[dependencies]')[1];
      if (dependencySection) {
        const lines = dependencySection.split('\n');
        const dependencies = [];
        
        for (const line of lines) {
          if (line.includes('=') && !line.startsWith('[')) {
            const depName = line.split('=')[0].trim();
            if (depName) {
              dependencies.push(depName);
            }
          }
        }
        
        return dependencies;
      }
    }

    return [];
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    return [];
  }
};

export const getRepositoryContributors = async (owner: string, repo: string): Promise<GitHubUser[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`);
  if (!response.ok) {
    throw new Error('Failed to fetch repository contributors');
  }

  return response.json();
};

export const parseRepositoryUrl = (url: string): { platform: 'github' | 'gitlab', owner: string, repo: string } | null => {
  // GitHub URL patterns
  const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (githubMatch) {
    return {
      platform: 'github',
      owner: githubMatch[1],
      repo: githubMatch[2].replace('.git', '')
    };
  }

  // GitLab URL patterns
  const gitlabMatch = url.match(/gitlab\.com\/([^\/]+)\/([^\/]+)/);
  if (gitlabMatch) {
    return {
      platform: 'gitlab',
      owner: gitlabMatch[1],
      repo: gitlabMatch[2].replace('.git', '')
    };
  }

  return null;
};

// Mock function for extracting funding information from repository files
export const extractFundingInfo = async (owner: string, repo: string): Promise<{
  fundingAddress?: string;
  dependencySplits?: Record<string, number>;
  maintainers?: string[];
}> => {
  try {
    // Try to fetch .funding or funding.txt file
    const fundingFiles = ['funding.txt', '.funding', 'FUNDING.yml', 'contributors.txt'];
    
    for (const filename of fundingFiles) {
      try {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filename}`);
        if (response.ok) {
          const data = await response.json();
          const content = atob(data.content);
          
          // Parse funding information from the file
          // This is a simplified parser - in a real app, you'd have more sophisticated parsing
          const lines = content.split('\n');
          const fundingInfo: any = {};
          
          for (const line of lines) {
            if (line.includes('cardano:') || line.includes('ada:')) {
              fundingInfo.fundingAddress = line.split(':')[1].trim();
            }
            
            if (line.includes('maintainer:')) {
              if (!fundingInfo.maintainers) fundingInfo.maintainers = [];
              fundingInfo.maintainers.push(line.split(':')[1].trim());
            }
          }
          
          return fundingInfo;
        }
      } catch (error) {
        // Continue to next file if this one fails
        continue;
      }
    }
    
    return {};
  } catch (error) {
    console.error('Error extracting funding info:', error);
    return {};
  }
};
