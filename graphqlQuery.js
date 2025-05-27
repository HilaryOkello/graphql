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
    events(where: {eventId: {_eq: 75}}) {
      level
    }
    transactions(
      where: {type: {_eq: "xp"}, eventId: {_eq: 75}}
      order_by: {createdAt: asc}
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
    progresses(where: {eventId: {_eq: 75}}, order_by: {createdAt: desc}) {
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
    results(where: {eventId: {_eq: 75}}, order_by: {createdAt: desc}) {
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
    skills: transactions(
      order_by: {type: asc, amount: desc}
      distinct_on: [type]
      where: {eventId: {_eq: 75}, _and: {type: {_like: "skill_%"}}}
    ) {
      type
      amount
      __typename
    }
  }
}
`;

export function processUserData(data) {
  const user = data.user[0];
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
      level: user.events[0].level,
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