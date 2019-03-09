import React, { Fragment } from 'react'
import { lifecycle, compose, withState, pure } from 'recompose'
import { pathOr, isEmpty } from 'ramda'
import Web3 from 'web3'
import CSSModules from 'react-css-modules'
import styles from './styles.module.scss'
import MessageForm from '../MessageForm'

const Main = ({ isLoading, metaMask, defaultAccount }) => (
  <Fragment>
    {isLoading ? <p styleName="loading">Loading...</p> : null}
    {!isLoading && !metaMask ? <p styleName="noMetaMask">MetaMask injection not found</p> : null}
    {!isLoading && metaMask ? <MessageForm web3={metaMask} defaultAccount={defaultAccount} /> : null}
  </Fragment>
)

export default compose(
  pure,
  withState('isLoading', 'setLoading', true),
  withState('metaMask', 'setMetaMask', null),
  withState('defaultAccount', 'setDefaultAccount', null),
  lifecycle({
    componentDidMount() {
      window.addEventListener('load', async () => {
        const metaMask = pathOr(false, ['web3', 'currentProvider', 'isMetaMask'], window) ? new Web3(window.web3.currentProvider) : null
        const accounts = metaMask && await metaMask.eth.getAccounts()
        this.setState({
          isLoading: false,
          metaMask: !isEmpty(accounts),
          defaultAccount: accounts[0]
        })
      })
    }
  }),
  CSSModules(styles)
)(Main)