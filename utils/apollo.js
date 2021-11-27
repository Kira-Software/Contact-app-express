const ApolloClient = require("apollo-boost").ApolloClient;
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const fetch = require("cross-fetch/polyfill").fetch;

const apollo_client = new ApolloClient({
  link: createHttpLink({
    uri: "http://localhost:8080/v1/graphql",
    fetch,
    headers: {
      "x-hasura-admin-secret": "Kirubel@21",
    },
  }),
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

module.exports = apollo_client;
