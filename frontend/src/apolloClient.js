import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink } from '@apollo/client';

const httpLink = new HttpLink({ uri: 'https://travel-booking-app-2.onrender.com/api' || 'http://localhost:4000/api' });

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('auth-token');
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });
  return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const ApolloWrapper = ({ children }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);
