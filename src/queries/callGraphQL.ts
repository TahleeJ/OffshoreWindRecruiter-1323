import { API, graphqlOperation } from "aws-amplify";
import { GraphQLResult, GRAPHQL_AUTH_MODE } from "@aws-amplify/api";

export interface GraphQLOptions {
  input?: object;
  variables?: object;
  authMode?: GRAPHQL_AUTH_MODE;
}

/** This function is a wrapper for 2 graphQL ones. Pass it a query and some options please. */
async function callGraphQL<T>(query: any, options?: GraphQLOptions): Promise<GraphQLResult<T>> {
  return (await API.graphql(graphqlOperation(query, options))) as GraphQLResult<T>
}

export default callGraphQL;