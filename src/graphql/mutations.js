/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSettings = /* GraphQL */ `
  mutation CreateSettings(
    $input: CreateSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    createSettings(input: $input, condition: $condition) {
      userId
      settings
      createdAt
      updatedAt
    }
  }
`;
export const updateSettings = /* GraphQL */ `
  mutation UpdateSettings(
    $input: UpdateSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    updateSettings(input: $input, condition: $condition) {
      userId
      settings
      createdAt
      updatedAt
    }
  }
`;
export const deleteSettings = /* GraphQL */ `
  mutation DeleteSettings(
    $input: DeleteSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    deleteSettings(input: $input, condition: $condition) {
      userId
      settings
      createdAt
      updatedAt
    }
  }
`;
export const createTagEntity = /* GraphQL */ `
  mutation CreateTagEntity(
    $input: CreateTagEntityInput!
    $condition: ModelTagEntityConditionInput
  ) {
    createTagEntity(input: $input, condition: $condition) {
      userId
      teId
      kind
      entity
      createdAt
      updatedAt
    }
  }
`;
export const updateTagEntity = /* GraphQL */ `
  mutation UpdateTagEntity(
    $input: UpdateTagEntityInput!
    $condition: ModelTagEntityConditionInput
  ) {
    updateTagEntity(input: $input, condition: $condition) {
      userId
      teId
      kind
      entity
      createdAt
      updatedAt
    }
  }
`;
export const deleteTagEntity = /* GraphQL */ `
  mutation DeleteTagEntity(
    $input: DeleteTagEntityInput!
    $condition: ModelTagEntityConditionInput
  ) {
    deleteTagEntity(input: $input, condition: $condition) {
      userId
      teId
      kind
      entity
      createdAt
      updatedAt
    }
  }
`;
export const createChallenges = /* GraphQL */ `
  mutation CreateChallenges(
    $input: CreateChallengesInput!
    $condition: ModelChallengesConditionInput
  ) {
    createChallenges(input: $input, condition: $condition) {
      userId
      challengeId
      challenge
      createdAt
      updatedAt
    }
  }
`;
export const updateChallenges = /* GraphQL */ `
  mutation UpdateChallenges(
    $input: UpdateChallengesInput!
    $condition: ModelChallengesConditionInput
  ) {
    updateChallenges(input: $input, condition: $condition) {
      userId
      challengeId
      challenge
      createdAt
      updatedAt
    }
  }
`;
export const deleteChallenges = /* GraphQL */ `
  mutation DeleteChallenges(
    $input: DeleteChallengesInput!
    $condition: ModelChallengesConditionInput
  ) {
    deleteChallenges(input: $input, condition: $condition) {
      userId
      challengeId
      challenge
      createdAt
      updatedAt
    }
  }
`;
