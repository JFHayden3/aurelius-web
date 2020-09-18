/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSettings = /* GraphQL */ `
  query GetSettings($userId: ID!) {
    getSettings(userId: $userId) {
      userId
      settings
      createdAt
      updatedAt
    }
  }
`;
export const listSettingss = /* GraphQL */ `
  query ListSettingss(
    $userId: ID
    $filter: ModelSettingsFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSettingss(
      userId: $userId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        settings
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getTagEntity = /* GraphQL */ `
  query GetTagEntity($userId: ID!, $teId: ID!) {
    getTagEntity(userId: $userId, teId: $teId) {
      userId
      teId
      kind
      entity
      createdAt
      updatedAt
    }
  }
`;
export const listTagEntitys = /* GraphQL */ `
  query ListTagEntitys(
    $userId: ID
    $teId: ModelIDKeyConditionInput
    $filter: ModelTagEntityFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTagEntitys(
      userId: $userId
      teId: $teId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        teId
        kind
        entity
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getJournalEntry = /* GraphQL */ `
  query GetJournalEntry($userId: ID!, $jeId: ID!) {
    getJournalEntry(userId: $userId, jeId: $jeId) {
      userId
      jeId
      articles {
        items {
          userId
          jaId
          entryId
          kind
          content
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
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
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getJournalArticle = /* GraphQL */ `
  query GetJournalArticle($userId: ID!, $jaId: ID!) {
    getJournalArticle(userId: $userId, jaId: $jaId) {
      userId
      jaId
      entryId
      kind
      content
      createdAt
      updatedAt
    }
  }
`;
export const listJournalArticles = /* GraphQL */ `
  query ListJournalArticles(
    $userId: ID
    $jaId: ModelIDKeyConditionInput
    $filter: ModelJournalArticleFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listJournalArticles(
      userId: $userId
      jaId: $jaId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        jaId
        entryId
        kind
        content
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;