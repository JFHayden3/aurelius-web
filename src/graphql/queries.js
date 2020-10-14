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
      jeIdAgain
      articles {
        items {
          userId
          jaId
          entryId
          kind
          content
          searchableText
          refTags
          wordCount
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
        jeIdAgain
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
      searchableText
      refTags
      wordCount
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
        searchableText
        refTags
        wordCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getViceLog = /* GraphQL */ `
  query GetViceLog($userId: ID!, $vlId: ID!) {
    getViceLog(userId: $userId, vlId: $vlId) {
      userId
      vlId
      log
      createdAt
      updatedAt
    }
  }
`;
export const listViceLogs = /* GraphQL */ `
  query ListViceLogs(
    $userId: ID
    $vlId: ModelIDKeyConditionInput
    $filter: ModelViceLogFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listViceLogs(
      userId: $userId
      vlId: $vlId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        vlId
        log
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
