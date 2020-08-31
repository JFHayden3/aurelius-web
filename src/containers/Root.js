import React from 'react'
import { Provider, useSelector } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom'
import store from '../configureStore'
import { Layout, Menu, Spin } from 'antd';
import { dateAsYyyyMmDd } from '../kitchenSink'
import {
  fetchEntries,
  fetchAllKeys,
  createNewEntry,
  selectEntryById,
  computeNextArticleId,
  syncDirtyEntries
} from "../model/journalEntriesSlice";
import { addArticle } from "../model/journalArticlesSlice";
import { fetchVirtues, syncDirtyVirtues } from "../model/virtueSlice"
import { fetchVices, syncDirtyVices } from "../model/viceSlice"
import { fetchViceLogEntries, syncDirtyViceLogEntries } from "../model/viceLogSlice"

import { fetchSettings, getDefaultArticleKindsForToday, selectArticleSettingByArticleKind } from "../model/settingsSlice"
import { getStartingContent } from '../model/newArticleStartingContentArbiter'
import 'antd/dist/antd.css';
import { LifeJournal } from '../components/LifeJournal'
import { ViceBank } from '../components/ViceBank'
import { ViceEditor } from '../components/ViceEditor'
import { VirtueBank } from '../components/VirtueBank'
import { VirtueEditor } from '../components/VirtueEditor'
import { SettingsSetter } from '../components/SettingsSetter'
import { selectIsInitializationComplete, setInitialized } from '../model/metaSlice'
import { createSelector } from '@reduxjs/toolkit';
const { Header, Content, Footer, Sider } = Layout;

function todayAsYyyyMmDd() {
  return dateAsYyyyMmDd(new Date(Date.now()))
}

// TODO this logic should probably be moved into a dedicated start-up coordinator 

const doFetchSettings = store.dispatch(fetchSettings({ user: 'testUser' }))
const doFetchJournalEntries = store.dispatch(
  fetchEntries({ user: 'testUser', maxEndDate: todayAsYyyyMmDd(), maxNumEntries: 10 }))
const doFetchVices = store.dispatch(fetchVices({ user: 'testUser' }))
const doFetchViceLogs = store.dispatch(fetchViceLogEntries({ user: 'testUser' }))
const doFetchVirtues = store.dispatch(fetchVirtues({ user: 'testUser' }))
const doFetchKeys = store.dispatch(fetchAllKeys({ user: 'testUser' }))
Promise.allSettled([doFetchSettings, doFetchJournalEntries, doFetchVices, doFetchVirtues, doFetchViceLogs])
  .then((action) => {
    if (action.error) {
      // TODO retry and/or put the UI into an error state
      console.log("\n\nINITIAL FETCH FAILED\n\n")
    } else {
      // TODO see note above about root level reference. Right now this is less efficient 
      // than it could be as we only depend on settings being present for the render.
      const payload = { dateId: todayAsYyyyMmDd() }
      if (!selectEntryById(store.getState(), payload.dateId)) {
        store.dispatch(createNewEntry(payload))
        getDefaultArticleKindsForToday(store.getState())
          .forEach((articleKind) => {
            const state = store.getState()
            const nextArticleId = computeNextArticleId(state, payload.dateId)
            const articleTitle = selectArticleSettingByArticleKind(state, articleKind).title
            const defaultContent = getStartingContent(articleKind, state, store.dispatch)
            store.dispatch(addArticle(
              {
                entryId: payload.dateId,
                articleId: nextArticleId,
                articleKind,
                articleTitle,
                defaultContent,
              }))
          })
      }
      store.dispatch(setInitialized())

    }
  })

setInterval(() => {
 //store.dispatch(syncDirtyEntries())
 //store.dispatch(syncDirtyVices())
 //store.dispatch(syncDirtyVirtues())
 //store.dispatch(syncDirtyViceLogEntries())
}, 2500)

export const Root = () => {
  const isInitialized = useSelector(state => selectIsInitializationComplete(state))

  if (!isInitialized) {
    return (<div><Spin/></div>)
  }
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
        }}
          theme="light">
          <div className="logo" />
          <Menu defaultSelectedKeys={["journal"]} mode="inline">
            <Menu.Item key="journal" >
              <Link to={`/journal`}>Journal</Link>
            </Menu.Item>
            <Menu.Item key="vices">
              <Link to={`/vices`}>Vices</Link>
            </Menu.Item>
            <Menu.Item key="virtues">
              <Link to={`/virtues`}>Virtues</Link>
            </Menu.Item>
            <Menu.Item key="settings">
              <Link to={`/settings`}>Settings</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout theme="light" className="site-layout" style={{ marginLeft: '200px' }}>
          <Content>
            <div className="site-layout-background" style={{ minHeight: 360 }}>
              <Switch>
                <Route exact path="/journal" component={LifeJournal} />
                <Route exact path="/vices" component={ViceBank} />
                <Route exact path="/vices/edit/:viceId" component={ViceEditor} />
                <Route exact path="/virtues" component={VirtueBank} />
                <Route exact path="/virtues/edit/:virtueId" component={VirtueEditor} />
                <Route exact path="/settings" component={SettingsSetter} />
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Aurelius ©2020 Created by Two Carls LLC</Footer>
        </Layout>
      </Layout>
    </Router>
  )
}