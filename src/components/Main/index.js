import React, { Fragment } from 'react'
import { lifecycle, compose, withStateHandlers, pure } from 'recompose'
import { pathOr, isEmpty } from 'ramda'
import Web3 from 'web3'
import CSSModules from 'react-css-modules'
import styles from './styles.module.scss'
import MessageForm from '../MessageForm'

const Main = ({ isLoading, metaMask, defaultAccount, loggedIn, signIn }) => (
  <Fragment>
    {isLoading ? <p styleName="loading">Loading...</p> : null}
    {!isLoading && !metaMask ? <p styleName="noMetaMask">MetaMask injection not found</p> : null}
    {!isLoading && metaMask && !loggedIn ? <p>You need to <a href="/" onClick={signIn}>sign</a> in to your MetaMask extension</p> : null}
    {!isLoading && metaMask && loggedIn ? <MessageForm web3={metaMask} defaultAccount={defaultAccount} /> : null}
  </Fragment>
)

export default compose(
  pure,
  withStateHandlers({
    isLoading: true,
    metaMask: false,
    defaultAccount: null,
    loggedIn: false
  },
  {
    signIn: () => e => {
      e.preventDefault()
      window.ethereum.enable()
    }
  }),
  lifecycle({
    componentDidMount() {
      window.addEventListener('load', async () => {
        const metaMask = pathOr(false, ['web3', 'currentProvider', 'isMetaMask'], window) ? new Web3(window.web3.currentProvider) : null

        if (metaMask) {
          window.web3.currentProvider.publicConfigStore.on('update', ({ selectedAddress }) => {
            this.setState({
              defaultAccount: selectedAddress,
              loggedIn: !!selectedAddress,
            })
          })
        }

        const accounts = metaMask && await metaMask.eth.getAccounts()
        const defaultAccount = accounts && accounts[0]
        this.setState({
          isLoading: false,
          metaMask,
          loggedIn: !!accounts && !isEmpty(accounts),
          defaultAccount
        })
      })
    }
  }),
  CSSModules(styles)
)(Main)