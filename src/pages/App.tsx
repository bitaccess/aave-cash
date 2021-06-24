import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Home from './Home'
import SignIn from './SignIn'
import Loan from './Loan'
import LocationPicker from './LocationPicker'
import VerifyPhone from './VerifyPhone'
import HowItWorks from './HowItWorks'
import Limits from './Limits'
import LevelUp from './LevelUp'
import Footer from 'components/Footer'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <Popups />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/" component={Home} />
              <Route exact strict path="/user/sign-in" component={SignIn} />
              <Route exact strict path="/how-it-works" component={HowItWorks} />
              <Route exact strict path="/user/sign-in/verify" component={VerifyPhone} />
              <Route exact strict path="/user/borrow" component={Loan} />
              <Route exact strict path="/user/locations" component={LocationPicker} />
              <Route exact strict path="/user/limits" component={Limits} />
              <Route exact strict path="/user/limits/increase" component={LevelUp} />
            </Switch>
          </Web3ReactManager>
          <Marginer />
        </BodyWrapper>
        <Footer />
      </AppWrapper>
    </Suspense>
  )
}
