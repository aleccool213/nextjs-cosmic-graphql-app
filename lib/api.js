import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import { CMS_GRAPHQL_URL } from "./constants";

export const client = new ApolloClient({
  uri: CMS_GRAPHQL_URL,
  cache: new InMemoryCache(),
});

const BUCKET_SLUG = process.env.COSMIC_BUCKET_SLUG;
const READ_KEY = process.env.COSMIC_READ_KEY;

if (!BUCKET_SLUG || !READ_KEY) {
  throw new Error("Cosmic API keys have not been set in the environment!");
}

/**
 * Query the Cosmic API by `slug` to see if post exists.
 *
 * @param {String} slug
 */
export async function getPreviewPostBySlug(slug) {
  const result = await client.query({
    query: gql`
      query CheckIfPostExistsQuery(
        $bucketSlug: String!
        $readKey: String!
        $slug: String!
      ) {
        getObject(
          bucket_slug: $bucketSlug
          input: { read_key: $readKey, slug: $slug }
        ) {
          title
        }
      }
    `,
    variables: {
      bucketSlug: BUCKET_SLUG,
      readKey: READ_KEY,
      slug,
    },
  });
  return result.data.getObject;
}

/**
 * Get all posts with their slug.
 */
export async function getAllPostsWithSlug() {
  const result = await client.query({
    query: gql`
      query getAllPostsWithSlugQuery($bucketSlug: String!, $readKey: String!) {
        getObjects(
          bucket_slug: $bucketSlug
          input: { read_key: $readKey, type: "posts", limit: 20 }
        ) {
          objects {
            _id
            slug
          }
        }
      }
    `,
    variables: {
      bucketSlug: BUCKET_SLUG,
      readKey: READ_KEY,
    },
  });
  return result.data.getObjects.objects;
}

/**
 *
 *
 * @param {Boolean} preview True when in preview mode
 */
export async function getAllPostsForHome(preview) {
  let status = "published";
  if (preview) {
    status = "all";
  }
  const result = await client.query({
    query: gql`
      query getAllPostsForHomeQuery(
        $bucketSlug: String!
        $readKey: String!
        $status: status
      ) {
        getObjects(
          bucket_slug: $bucketSlug
          input: {
            read_key: $readKey
            type: "posts"
            status: $status
            limit: 20
          }
        ) {
          objects {
            _id
            slug
            title
            metadata
            created_at
          }
        }
      }
    `,
    variables: {
      bucketSlug: BUCKET_SLUG,
      readKey: READ_KEY,
      status,
    },
  });
  return result.data.getObjects.objects;
}

/**
 * Query the Cosmic API to get a single posts data and other posts data.
 *
 * @param {String} slug Current post slug
 * @param {Boolean} preview True if in preview mode
 */
export async function getPostAndMorePosts(slug, preview) {
  let status = "published";
  if (preview) {
    status = "all";
  }
  const moreObjectsResults = await client.query({
    query: gql`
      query getPostQuery(
        $bucketSlug: String!
        $readKey: String!
        $status: status
      ) {
        getObjects(
          bucket_slug: $bucketSlug
          input: {
            read_key: $readKey
            type: "posts"
            status: $status
            limit: 3
          }
        ) {
          objects {
            _id
            slug
            title
            metadata
            created_at
          }
        }
      }
    `,
    variables: {
      bucketSlug: BUCKET_SLUG,
      readKey: READ_KEY,
      status,
    },
  });

  const singleObjectResult = await client.query({
    query: gql`
      query getMorePostsQuery(
        $bucketSlug: String!
        $readKey: String!
        $slug: String!
        $status: status
      ) {
        getObject(
          bucket_slug: $bucketSlug
          input: { read_key: $readKey, slug: $slug, status: $status }
        ) {
          _id
          slug
          title
          metadata
          created_at
        }
      }
    `,
    variables: {
      bucketSlug: BUCKET_SLUG,
      readKey: READ_KEY,
      slug,
      status,
    },
  });

  const morePosts = moreObjectsResults.data.getObjects.objects
    ?.filter(({ slug: object_slug }) => object_slug !== slug)
    .slice(0, 2);

  return {
    post: singleObjectResult.data.getObject,
    morePosts: morePosts,
  };
}
