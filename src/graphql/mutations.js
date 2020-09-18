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
export const createJournalEntry = /* GraphQL */ `
  mutation CreateJournalEntry(
    $input: CreateJournalEntryInput!
    $condition: ModelJournalEntryConditionInput
  ) {
    createJournalEntry(input: $input, condition: $condition) {
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
export const updateJournalEntry = /* GraphQL */ `
  mutation UpdateJournalEntry(
    $input: UpdateJournalEntryInput!
    $condition: ModelJournalEntryConditionInput
  ) {
    updateJournalEntry(input: $input, condition: $condition) {
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
export const deleteJournalEntry = /* GraphQL */ `
  mutation DeleteJournalEntry(
    $input: DeleteJournalEntryInput!
    $condition: ModelJournalEntryConditionInput
  ) {
    deleteJournalEntry(input: $input, condition: $condition) {
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
export const createJournalArticle = /* GraphQL */ `
  mutation CreateJournalArticle(
    $input: CreateJournalArticleInput!
    $condition: ModelJournalArticleConditionInput
  ) {
    createJournalArticle(input: $input, condition: $condition) {
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
export const updateJournalArticle = /* GraphQL */ `
  mutation UpdateJournalArticle(
    $input: UpdateJournalArticleInput!
    $condition: ModelJournalArticleConditionInput
  ) {
    updateJournalArticle(input: $input, condition: $condition) {
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
export const deleteJournalArticle = /* GraphQL */ `
  mutation DeleteJournalArticle(
    $input: DeleteJournalArticleInput!
    $condition: ModelJournalArticleConditionInput
  ) {
    deleteJournalArticle(input: $input, condition: $condition) {
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
