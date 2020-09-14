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
