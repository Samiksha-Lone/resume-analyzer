const axios = require('axios');

async function fetchGithubRepos(username) {
  if (!username) return null;
  
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    const repos = response.data;
    
    const techStack = new Set();
    const repoDetails = repos.map(repo => {
      if (repo.language) techStack.add(repo.language);
      return {
        name: repo.name,
        language: repo.language,
        stars: repo.stargazers_count,
        description: repo.description
      };
    });

    return {
      username,
      repos: repoDetails,
      techStack: Array.from(techStack),
      totalStars: repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)
    };
  } catch (error) {
    console.error(`Error fetching GitHub data for ${username}:`, error.message);
    return null;
  }
}

function verifySkillsAgainstGithub(resumeSkills, githubData) {
  if (!githubData || !githubData.techStack) return { matches: [], missing: [] };
  
  const githubStackLow = githubData.techStack.map(s => s.toLowerCase());
  const matches = resumeSkills.filter(skill => 
    githubStackLow.some(gs => gs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(gs))
  );

  return {
    matches,
    missingInGithub: resumeSkills.filter(s => !matches.includes(s)),
    githubTechStack: githubData.techStack
  };
}

module.exports = {
  fetchGithubRepos,
  verifySkillsAgainstGithub
};
