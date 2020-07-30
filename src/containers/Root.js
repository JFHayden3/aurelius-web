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
import { fetchEntries, createNewEntry, selectEntryById, computeNextArticleId, syncDirtyEntries } from "../model/journalEntriesSlice";
import { addArticle } from "../model/journalArticlesSlice";
import { fetchVices, syncDirtyVices } from "../model/viceSlice"
import { getDefaultArticleKindsForToday, selectArticleSettingByArticleKind } from "../model/settingsSlice"

import 'antd/dist/antd.css';
import { LifeJournal } from '../components/LifeJournal'
import { ViceBank } from '../components/ViceBank'
import { ViceEditor } from '../components/ViceEditor'

const { Header, Content, Footer, Sider } = Layout;

function todayAsYyyyMmDd() {
  const now = new Date(Date.now())
  function monthStr(date) {
    const monthNum = date.getMonth() + 1
    return monthNum < 10 ? "0" + monthNum : monthNum.toString()
  }
  return Number.parseInt("" + now.getFullYear() + monthStr(now) + now.getDate())
}

// TODO this logic should probably be moved into a dedicated start-up coordinator 
store.dispatch(fetchVices({ user: 'testUser'}))
store.dispatch(
  fetchEntries({ user: 'testUser', maxEndDate: todayAsYyyyMmDd(), maxNumEntries: 10 }))
  .then((action) => {
    if (action.error) {
      // TODO retry and/or put the UI into an error state
      console.log("\n\nINITIAL FETCH FAILED\n\n")
    } else {
      const payload = { dateId: todayAsYyyyMmDd() }
      if (!selectEntryById(store.getState(), payload.dateId)) {
        store.dispatch(createNewEntry(payload))
        getDefaultArticleKindsForToday(store.getState())
          .forEach((articleKind) => {
            const nextArticleId = computeNextArticleId(store.getState(), payload.dateId)
            const articleSettings = selectArticleSettingByArticleKind(store.getState(), articleKind)
            store.dispatch(addArticle(
              {
                entryId: payload.dateId,
                articleId: nextArticleId,
                articleKind,
                articleSettings
              }))
          }
          )
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