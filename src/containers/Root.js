import React, { Component, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Switch,
  Route,
  useLocation,
  useHistory,
  Link,
} from 'react-router-dom'
import store from '../configureStore'
import { Layout, Menu, Spin } from 'antd';
import { dateAsYyyyMmDd } from '../kitchenSink'
import {
  fetchEntries,
  fetchAllKeys,
  createNewEntry,
  selectEntryById,
} from "../model/journalEntriesSlice";
import { addArticle, computeNextArticleId } from "../model/journalArticlesSlice";
import { fetchTagEntitys } from "../model/tagEntitySlice"
import { syncDirtyEntities, isAnyDirty } from "../model/dirtinessSlice"
import { fetchSettings, getDefaultArticleKindsForToday, selectArticleSettingByArticleKind } from "../model/settingsSlice"
import { getStartingContent } from '../model/newArticleStartingContentArbiter'
import 'antd/dist/antd.css';
import 'draft-js-mention-plugin/lib/plugin.css';
import { LifeJournal } from '../components/LifeJournal'
import { ViceBank } from '../components/ViceBank'
import { ViceEditor } from '../components/ViceEditor'
import { VirtueBank } from '../components/VirtueBank'
import { VirtueEditor } from '../components/VirtueEditor'
import { ChallengeBank } from '../components/ChallengeBank'
import { ChallengeEditor } from '../components/ChallengeEditor'
import { SettingsSetter } from '../components/SettingsSetter'
import { selectIsInitializationComplete, setInitialized, setAuthUser } from '../model/metaSlice'
import { Hub, Auth } from 'aws-amplify'

const { Header, Content, Footer, Sider } = Layout;

function todayAsYyyyMmDd() {
  return dateAsYyyyMmDd(new Date(Date.now()))
}

const LandingPage = () => {
  return (
    <button onClick={() => Auth.federatedSignIn()}>sign in</button>
  )
}

const App = () => {
  const isInitialized = useSelector(state => selectIsInitializationComplete(state))
  const location = useLocation()
  const history = useHistory()
  if (location.pathname === '/') {
    history.push(`/journal`)
  }
  if (!isInitialized) {
    return (<div><Spin /></div>)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
        theme="light">
        <div className="logo" />
        <Menu selectedKeys={[location.pathname]} mode="inline">
          <Menu.Item key="/journal" >
            <Link to={`/journal`}>Journal</Link>
          </Menu.Item>
          <Menu.Item key="/vices">
            <Link to={`/vices`}>Vices</Link>
          </Menu.Item>
          <Menu.Item key="/virtues">
            <Link to={`/virtues`}>Virtues</Link>
          </Menu.Item>
          <Menu.Item key="/challenges">
            <Link to={`/challenges`}>Challenges</Link>
          </Menu.Item>
          <Menu.Item key="/settings">
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
              <Route exact path="/challenges" component={ChallengeBank} />
              <Route exact path="/challenges/edit/:challengeId" component={ChallengeEditor} />
              <Route exact path="/settings" component={SettingsSetter} />
            </Switch>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Aurelius ©2020 Created by Two Carls LLC</Footer>
      </Layout>
    </Layout>
  )
}

class Root extends Component {
  // TODO this logic should probably be moved into a dedicated start-up coordinator
  async componentDidMount() {
    const doGetAuthUser = Auth.currentAuthenticatedUser().then(authUser => {
      store.dispatch(setAuthUser({ authUser: { username: authUser.getUsername(), sub: authUser.attributes.sub } }))
    })
    doGetAuthUser.then((sub) => {
      const doFetchSettings = store.dispatch(fetchSettings())
      const doFetchJournalEntries = store.dispatch(
        fetchEntries({ maxEndDate: todayAsYyyyMmDd(), maxNumEntries: 10 }))
      const doFetchTagEntities = store.dispatch(fetchTagEntitys())
      const doFetchKeys = store.dispatch(fetchAllKeys())
      Promise.allSettled([doFetchSettings, doFetchJournalEntries, doFetchTagEntities])
        .then((action) => {
          if (action.error) {
            // TODO retry and/or put the UI into an error state
            console.log("\n\nINITIAL FETCH FAILED\n\n")
          } else {
            const payload = { dateId: todayAsYyyyMmDd() }
            if (!selectEntryById(store.getState(), payload.dateId)) {
              store.dispatch(createNewEntry(payload)).then(res => {
                var nextArticleId = computeNextArticleId(store.getState(), payload.dateId)
                getDefaultArticleKindsForToday(store.getState(), new Date(Date.now()))
                  .forEach((articleKind) => {
                    const state = store.getState()
                    const articleTitle = selectArticleSettingByArticleKind(state, articleKind).title
                    const defaultContent = getStartingContent(articleKind, state, store.dispatch)
                    store.dispatch(addArticle(
                      {
                        entryId: payload.dateId,
                        articleId: nextArticleId++,
                        articleKind,
                        articleTitle,
                        defaultContent,
                      }))
                  })
              })
            }
            store.dispatch(setInitialized())
          }
        })
    })

    setInterval(() => {
      if (isAnyDirty(store.getState())) {
        store.dispatch(syncDirtyEntities())
      }
    }, 2500)
  }

  render() {
    return (<App />)
  }
}

export const AuthRoot = () => {
  const [signedIn, setSignedIn] = useState(false)
  Auth.currentAuthenticatedUser().then(authUser => {
    // Moves things along automatically if we're already logged in
    setSignedIn(true)
  })
  useEffect(() => {
    // set listener for auth events
    Hub.listen('auth', (data) => {
      const { payload } = data
      if (payload.event === 'signIn') {
        setSignedIn(true)
      }
      // this listener is needed for form sign ups since the OAuth will redirect & reload
      if (payload.event === 'signOut') {
        setSignedIn(false)
      }
    })
  }, [])
  return (
    <div>
      {!signedIn && <LandingPage />}
      {signedIn && <Root />}
    </div>
  )
}