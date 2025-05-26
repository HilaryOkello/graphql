// format into exportable GraphQL query
export const GET_USER_INFO = gql`
  query GetUserInfo {
    user {
      id
      login
      email: attrs(path: "email")
      firstName: attrs(path: "firstName")
      lastName: attrs(path: "lastName")
      auditRatio
      totalUp
      totalDown
    }
  }
`;
