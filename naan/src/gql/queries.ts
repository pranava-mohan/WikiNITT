import { gql } from "graphql-request";

export const GET_ARTICLES = gql`
  query GetArticles(
    $category: String
    $limit: Int
    $offset: Int
    $featured: Boolean
  ) {
    articles(
      category: $category
      limit: $limit
      offset: $offset
      featured: $featured
    ) {
      id
      title
      slug
      category
      thumbnail
      featured
      description
      author {
        name
        avatar
      }
      createdAt
    }
  }
`;

export const GET_ARTICLE_BY_SLUG = gql`
  query GetArticleBySlug($slug: String!) {
    articleBySlug(slug: $slug) {
      id
      title
      content
      slug
      category
      thumbnail
      featured
      description
      author {
        id
        name
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;
