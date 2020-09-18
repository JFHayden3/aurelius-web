/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateSettings = /* GraphQL */ `
  subscription OnCreateSettings($owner: String!) {
    onCreateSettings(owner: $owner) {
      userId
      settings
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateSettings = /* GraphQL */ `
  subscription OnUpdateSettings($owner: String!) {
    onUpdateSettings(owner: $owner) {
      userId
      settings
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteSettings = /* GraphQL */ `
  subscription OnDeleteSettings($owner: String!) {
    onDeleteSettings(owner: $owner) {
      userId
      settings
      createdAt
      updatedAt
    }
  }
`;
export const onCreateTagEntity = /* GraphQL */ `
  subscription OnCreateTagEntity($owner: String!) {
    onCreateTagEntity(owner: $owner) {
      userId
      teId
      kind
      entity
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateTagEntity = /* GraphQL */ `
  subscription OnUpdateTagEntity($owner: String!) {
    onUpdateTagEntity(owner: $owner) {
      userId
      teId
      kind
      entity
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteTagEntity = /* GraphQL */ `
  subscription OnDeleteTagEntity($owner: String!) {
    onDeleteTagEntity(owner: $owner) {
      userId
      teId
      kind
      entity
      createdAt
      updatedAt
    }
  }
`;
export const onCreateJournalEntry = /* GraphQL */ `
  subscription OnCreateJournalEntry($owner: String!) {
    onCreateJournalEntry(owner: $owner) {
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
export const onUpdateJournalEntry = /* GraphQL */ `
  subscription OnUpdateJournalEntry($owner: String!) {
    onUpdateJournalEntry(owner: $owner) {
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
export const onDeleteJournalEntry = /* GraphQL */ `
  subscription OnDeleteJournalEntry($owner: String!) {
    onDeleteJournalEntry(owner: $owner) {
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
export const onCreateJournalArticle = /* GraphQL */ `
  subscription OnCreateJournalArticle($owner: String!) {
    onCreateJournalArticle(owner: $owner) {
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
export const onUpdateJournalArticle = /* GraphQL */ `
  subscription OnUpdateJournalArticle($owner: String!) {
    onUpdateJournalArticle(owner: $owner) {
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
export const onDeleteJournalArticle = /* GraphQL */ `
  subscription OnDeleteJournalArticle($owner: String!) {
    onDeleteJournalArticle(owner: $owner) {
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
