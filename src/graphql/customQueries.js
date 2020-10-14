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