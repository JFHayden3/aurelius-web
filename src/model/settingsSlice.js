import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

const dummyState = {
  // Also defines set of available article types
  articleSettings: {
    REFLECTION: {
      title:"Reflections",
      hintText:"blah blah reflections hint text",
      promptFrequency: "DAILY",
      ordering:1,
      isUserCreated:false,
    },
    INTENTION: {
      title:"Intentions",
      hintText:"blah blah blah intentions hint text",
      promptFrequency: "DAILY",
      ordering:2,
      isUserCreated:false,
    },
    GRATITUDE: {
      title: "Gratitude",
      hintText: "Blah blah some shit about gratitude",
      promptFrequency:"DAILY",
      ordering:3,
      isUserCreated:false,
    }
  }
}