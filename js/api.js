import { processUserData } from './data.js'

/**
 * API communication and GraphQL queries for the Lock In application
 */

// GraphQL endpoint
export const GRAPHQL_ENDPOINT = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';

/**
 * GraphQL query to get complete user data
 */
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
      where: {eventId: {_eq: 75}, object: {type: {_eq: "project"}}, grade: {_lt: 1}}
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

/**
 * Fetches data from the GraphQL API
 * @param {string} query - The GraphQL query
 * @param {string} token - The JWT token for authentication
 * @returns {Promise<Object>} - The GraphQL response data
 */
export async function fetchGraphQL(query, token) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: query
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }

    return data.data;
  } catch (error) {
    console.error('GraphQL fetch error:', error);
    throw error;
  }
}

/**
 * Fetches user profile data from the GraphQL API
 * @param {string} token - The JWT token for authentication
 * @returns {Promise<Object>} - The processed user data
 */
export async function getUserProfileData(token) {
  try {
    const data = await fetchGraphQL(GET_COMPLETE_USER_DATA, token);
    return processUserData(data);
  } catch (error) {
    console.error('Error fetching user profile data:', error);
    throw error;
  }
}
