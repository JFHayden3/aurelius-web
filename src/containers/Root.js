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
import { Layout, Menu, Spin, Affix, Space } from 'antd';
import { FileTextOutlined, FallOutlined, RiseOutlined, SettingOutlined, TrophyOutlined } from '@ant-design/icons';
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
import { JournalButton, VicesButton, VirtuesButton, ChallengesButton, SettingsButton } from '../components/NavButtons'
import { selectIsInitializationComplete, setInitialized, setAuthUser } from '../model/metaSlice'
import { Hub, Auth } from 'aws-amplify'
import { LandingPage } from './LandingPage'

const { Header, Content, Footer, Sider } = Layout;

function todayAsYyyyMmDd() {
  return dateAsYyyyMmDd(new Date(Date.now()))
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
      <Affix offsetTop={30} style={{ position: 'absolute', left: '3%' }}>
        <JournalButton />
      </Affix>
      <Affix offsetTop={80} style={{ position: 'absolute', left: '3%' }}>
        <VicesButton />
      </Affix>
      <Affix offsetTop={130} style={{ position: 'absolute', left: '3%' }}>
        <VirtuesButton />
      </Affix>
      <Affix offsetTop={180} style={{ position: 'absolute', left: '3%' }}>
        <ChallengesButton />
      </Affix>
      <Affix offsetTop={230} style={{ position: 'absolute', left: '3%' }}>
        <SettingsButton />
      </Affix>

      <Layout theme="light" className="site-layout" style={{ marginLeft: '17vw', marginRight: '17vw' }}>
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
    </Layout >
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