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
      object {
        name
      }
    }
    passedProjects: progresses_aggregate(
      where: {eventId: {_eq: 75}, object: {type: {_eq: "project"}}, isDone: {_eq: true}, grade: {_gte: 1}}
    ) {
      aggregate {
        count
      }
    }
    failedProjects: progresses_aggregate(
      where: {eventId: {_eq: 75}, object: {type: {_eq: "project"}}, grade: {_lt: 0}}
    ) {
      aggregate {
        count
      }
    }
    averageGrade: progresses_aggregate(
      where: {eventId: {_eq: 75}, object: {type: {_eq: "project"}}}
    ) {
      aggregate {
        avg {
          grade
        }
      }
    }
    currWorkingOn: groups(
      order_by: {createdAt: asc}
      where: {group: {status: {_eq: working}, eventId: {_eq: 75}}}
    ) {
      group {
        createdAt
        object {
          name
        }
      }
    }
    skills: transactions(
      order_by: {type: asc, amount: desc}
      distinct_on: [type]
      where: {eventId: {_eq: 75}, _and: {type: {_like: "skill_%"}}}
    ) {
      type
      amount
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
  
  // currently working on projects and days since created
  const currentProjects = user.currWorkingOn.map(group => ({
    name: group.group.object.name,
    daysSinceCreated: Math.floor((new Date() - new Date(group.group.createdAt)) / (1000 * 60 * 60 * 24))
  }));
  
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
    skills: user.skills || []
  };
}
