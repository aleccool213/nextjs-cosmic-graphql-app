import { ApolloClient, InMemoryCache } from "@apollo/client";

import { CMS_GRAPHQL_URL } from "./constants";

export const client = new ApolloClient({
  uri: CMS_GRAPHQL_URL,
  cache: new InMemoryCache(),
});
