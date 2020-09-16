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
