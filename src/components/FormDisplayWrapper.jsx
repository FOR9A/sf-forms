"use client";
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '../config/apollo.js';
import FormDisplay from './FormDisplay.jsx';

/**
 * Wrapper component that provides Apollo Client with configurable GraphQL endpoint
 */
function FormDisplayWrapper({ 
  graphqlEndpoint = 'http://127.0.0.1:8000/graphql',
  authToken = null,
  ...props 
}) {
  // Create Apollo Client instance with the provided endpoint
  const apolloClient = React.useMemo(() => {
    return createApolloClient(graphqlEndpoint, authToken);
  }, [graphqlEndpoint, authToken]);

  return (
    <ApolloProvider client={apolloClient}>
      <FormDisplay {...props} />
    </ApolloProvider>
  );
}

export default FormDisplayWrapper;
