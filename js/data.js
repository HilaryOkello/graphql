/**
 * Data processing and transformation for the Lock In application
 */

/**
 * Processes raw user data from the GraphQL API
 * @param {Object} data - The raw data from the GraphQL API
 * @returns {Object} - The processed user data
 */
export function processUserData(data) {
  const user = data.user[0];
  
  // Calculate total XP
  const totalXP = user.transactions
    .reduce((sum, t) => sum + t.amount, 0);
  
  // currently working on projects and days since created
  const currentProjects = user.currWorkingOn.map(group => ({
    name: group.group.object.name,
    daysSinceCreated: Math.floor((new Date() - new Date(group.group.createdAt)) / (1000 * 60 * 60 * 24))
  }));
  
  // Process XP by project
  const xpByProject = {};
  user.transactions.forEach(transaction => {
    const projectName = transaction.object?.name
    if (!xpByProject[projectName]) {
      xpByProject[projectName] = 0;
    }
    xpByProject[projectName] += transaction.amount;
  });
  
  // Sort projects by XP (top 10)
  const topProjects = Object.entries(xpByProject)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  // Calculate pass/fail ratio from results
  const passedProjects = user.passedProjects.aggregate.count || 0;
  const failedProjects = user.failedProjects.aggregate.count || 0;
  const successRate = passedProjects / (passedProjects + failedProjects) * 100 || 0;
  
  // Process XP over time for chart (with proper date handling)
  const xpOverTime = {};
  let cumulativeXP = 0;
  
  user.transactions
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      cumulativeXP += transaction.amount;
      xpOverTime[monthYear] = cumulativeXP;
    });
  
  return {
    userInfo: {
      id: user.id,
      login: user.login,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      campus: user.campus,
      level: user.events[0].level,
      auditRatio: user.auditRatio,
      totalUp: user.totalUp,
      totalDown: user.totalDown
    },
    averageGrade: user.averageGrade.aggregate.avg.grade || 0,
    currentProjects: currentProjects,
    xp: {
      total: totalXP,
      byProject: topProjects,
      overTime: xpOverTime
    },
    auditRatio: {
      ratio: user.auditRatio,
      given: user.totalUp,
      received: user.totalDown
    },
    projects: {
      passed: passedProjects,
      failed: failedProjects,
      successRate: successRate,
      total: passedProjects + failedProjects,
    },
    skills: user.skills.nodes || []
  };
}
