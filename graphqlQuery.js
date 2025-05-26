export const GET_COMPLETE_USER_DATA = `
  query GetCompleteUserData {
    user {
      id
      login
      email: attrs(path: "email")
      firstName: attrs(path: "firstName")
      lastName: attrs(path: "lastName")
      auditRatio
      totalUp
      totalDown
      campus
      
      # XP transactions for total XP and XP over time
      transactions(
        where: { type: { _eq: "xp" } }
        order_by: { createdAt: asc }
      ) {
        id
        amount
        createdAt
        path
        object {
          name
          type
        }
      }
      
      # Progress data for project completion rates and levels
      progresses(order_by: { createdAt: desc }) {
        id
        grade
        createdAt
        updatedAt
        path
        isDone
        object {
          id
          name
          type
          attrs
        }
      }
      
      # Results for project pass/fail statistics
      results(order_by: { createdAt: desc }) {
        id
        grade
        createdAt
        updatedAt
        path
        object {
          id
          name
          type
          attrs
        }
      }
      
      # Additional transactions for audit tracking (up/down votes)
      transactionsUp: transactions(where: { type: { _eq: "up" } }) {
        id
        amount
        createdAt
        userId
      }
      
      transactionsDown: transactions(where: { type: { _eq: "down" } }) {
        id
        amount
        createdAt
        userId
      }
      
      # Additional user attributes for skills and level information
      attrs
    }
    
    # Get overall object information for project categorization
    object(
      where: {
        _or: [
          { type: { _eq: "project" } }
          { type: { _eq: "piscine" } }
          { type: { _eq: "exercise" } }
        ]
      }
    ) {
      id
      name
      type
      attrs
    }
  }
`;

export function processUserData(data) {
  const user = data.user[0]; // GraphQL returns array
  console.log('Processing user data:', user);
  
  // Calculate total XP
  const totalXP = user.transactions
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Process XP by project
  const xpByProject = {};
  user.transactions.forEach(transaction => {
    const projectName = transaction.object?.name || extractProjectName(transaction.path);
    if (!xpByProject[projectName]) {
      xpByProject[projectName] = 0;
    }
    xpByProject[projectName] += transaction.amount;
  });
  
  // Sort projects by XP (top 5)
  const topProjects = Object.entries(xpByProject)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // Calculate pass/fail ratio from results
  const passedProjects = user.results.filter(r => r.grade > 0).length;
  const failedProjects = user.results.filter(r => r.grade === 0).length;
  const successRate = passedProjects / (passedProjects + failedProjects) * 100 || 0;
  
  // Process XP over time for chart
  const xpOverTime = {};
  let cumulativeXP = 0;
  
  user.transactions
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      cumulativeXP += transaction.amount;
      xpOverTime[month] = cumulativeXP;
    });
  
  return {
    userInfo: {
      id: user.id,
      login: user.login,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      campus: user.campus,
      level: user.attrs?.level || 0,
      auditRatio: user.auditRatio,
      totalUp: user.totalUp,
      totalDown: user.totalDown
    },
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
      total: passedProjects + failedProjects
    }
  };
}