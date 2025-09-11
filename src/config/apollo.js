import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Default GraphQL endpoint - can be overridden by environment variables or props
const DEFAULT_GRAPHQL_ENDPOINT = 'http://127.0.0.1:8000/graphql';

// Create HTTP link
const createApolloClient = (graphqlEndpoint = DEFAULT_GRAPHQL_ENDPOINT, authToken = null) => {
  const httpLink = createHttpLink({
    uri: graphqlEndpoint,
  });

  // Auth link to add authorization header if token is provided
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        ...(authToken && { authorization: `Bearer ${authToken}` }),
        'Content-Type': 'application/json',
      }
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
};

export { createApolloClient, DEFAULT_GRAPHQL_ENDPOINT };
