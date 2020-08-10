import React, { Component } from 'react'
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom'
import store from '../configureStore'
import { Layout, Menu } from 'antd';
import { dateAsYyyyMmDd } from '../kitchenSink'
import { fetchEntries, createNewEntry, selectEntryById, computeNextArticleId, syncDirtyEntries } from "../model/journalEntriesSlice";
import { addArticle } from "../model/journalArticlesSlice";
import { fetchVices, syncDirtyVices } from "../model/viceSlice"
import { fetchSettings, getDefaultArticleKindsForToday, selectArticleSettingByArticleKind } from "../model/settingsSlice"
import { getStartingContent } from '../model/newArticleStartingContentArbiter'
import 'antd/dist/antd.css';
import { LifeJournal } from '../components/LifeJournal'
import { ViceBank } from '../components/ViceBank'
import { ViceEditor } from '../components/ViceEditor'
import { VirtueBank } from '../components/VirtueBank'
import { VirtueEditor } from '../components/VirtueEditor'

const { Header, Content, Footer, Sider } = Layout;

function todayAsYyyyMmDd() {
  return dateAsYyyyMmDd(new Date(Date.now()))
}

// TODO this logic should probably be moved into a dedicated start-up coordinator 
// TODO: I need a piece of state referenced at the root level that prevents *any* rendering
// from taking place until all init fetches have completed successfully. Have race conditions
// that can break the UI currently

const doFetchSettings = store.dispatch(fetchSettings({ user: 'testUser' }))
const doFetchJournalEntries = store.dispatch(
  fetchEntries({ user: 'testUser', maxEndDate: todayAsYyyyMmDd(), maxNumEntries: 10 }))
const doFetchVices = store.dispatch(fetchVices({ user: 'testUser' }))

Promise.allSettled([doFetchSettings, doFetchJournalEntries, doFetchVices])
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
            const defaultContent = getStartingContent(articleKind, state)
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
    }
  })

setInterval(() => {
  store.dispatch(syncDirtyEntries())
  store.dispatch(syncDirtyVices())
}, 2500)

export default class Root extends Component {
  render() {
    return (
      <Provider store={store}>
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
                  </Switch>
                </div>
              </Content>
              <Footer style={{ textAlign: 'center' }}>Aurelius ©2020 Created by Two Carls LLC</Footer>
            </Layout>
          </Layout>
        </Router>
      </Provider>
    )
  }
}