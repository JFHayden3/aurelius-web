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
export const getChallenges = /* GraphQL */ `
  query GetChallenges($userId: ID!, $challengeId: ID!) {
    getChallenges(userId: $userId, challengeId: $challengeId) {
      userId
      challengeId
      challenge
      createdAt
      updatedAt
    }
  }
`;
export const listChallengess = /* GraphQL */ `
  query ListChallengess(
    $userId: ID
    $challengeId: ModelIDKeyConditionInput
    $filter: ModelChallengesFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listChallengess(
      userId: $userId
      challengeId: $challengeId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        challengeId
        challenge
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getVices = /* GraphQL */ `
  query GetVices($userId: ID!, $viceId: ID!) {
    getVices(userId: $userId, viceId: $viceId) {
      userId
      viceId
      vice
      createdAt
      updatedAt
    }
  }
`;
export const listVicess = /* GraphQL */ `
  query ListVicess(
    $userId: ID
    $viceId: ModelIDKeyConditionInput
    $filter: ModelVicesFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVicess(
      userId: $userId
      viceId: $viceId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        viceId
        vice
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getVirtues = /* GraphQL */ `
  query GetVirtues($userId: ID!, $virtueId: ID!) {
    getVirtues(userId: $userId, virtueId: $virtueId) {
      userId
      virtueId
      virtue
      createdAt
      updatedAt
    }
  }
`;
export const listVirtuess = /* GraphQL */ `
  query ListVirtuess(
    $userId: ID
    $virtueId: ModelIDKeyConditionInput
    $filter: ModelVirtuesFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVirtuess(
      userId: $userId
      virtueId: $virtueId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        userId
        virtueId
        virtue
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
