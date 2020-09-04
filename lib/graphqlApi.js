import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import { CMS_GRAPHQL_URL } from "./constants";

export const client = new ApolloClient({
  uri: CMS_GRAPHQL_URL,
  cache: new InMemoryCache(),
});

client
  .query({
    query: gql`
      query GetPosts($readKey: String!) {
        getObjects(
          bucket_slug: "b8bdab30-e91e-11ea-9bc4-2d934da0491e"
          input: { limit: 20, read_key: $readKey, type: "posts" }
        ) {
          objects {
            title
            content
          }
        }
      }
    `,
    variables: {
      readKey: process.env.COSMIC_READ_KEY,
    },
  })
  .then((result) => console.log(result));
