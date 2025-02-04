/* eslint-disable */

export const listJournalEntryKeys = /* GraphQL */ `
  query ListJournalEntrys(
    $userId: ID
    $jeId: ModelIDKeyConditionInput
    $filter: ModelJournalEntryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listJournalEntrys(
      userId: $userId
      jeId: $jeId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        jeId
      }
      nextToken
    }
  }
`;

export const searchFilteredJournalKeys = /* GraphQL */ `
  query SearchJournalArticles(
    $filter: SearchableJournalArticleFilterInput
    $sort: SearchableJournalArticleSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchJournalArticles(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        jaId
        entryId
      }
      nextToken
      total
    }
  }
`;

export const listFilteredJournalKeys = /* GraphQL */` 
  query ListJournalArticles(
    $userId: ID
    $filter: ModelJournalArticleFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listJournalArticles(
      userId: $userId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        jaId
        entryId
      }
      nextToken
    }
  }
`;

export const listJournalEntrys = /* GraphQL */ `
  query ListJournalEntrys(
    $userId: ID
    $jeId: ModelIDKeyConditionInput
    $filter: ModelJournalEntryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listJournalEntrys(
      userId: $userId
      jeId: $jeId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        jeId
        articles {
          items {
            userId
            jaId
            entryId
            kind
            content
          }
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;