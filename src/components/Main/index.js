import React, { Fragment } from 'react'
import { lifecycle, compose, withState, pure } from 'recompose'
import { pathOr, isEmpty } from 'ramda'
import Web3 from 'web3'
import CSSModules from 'react-css-modules'
import styles from './styles.module.scss'
import MessageForm from '../MessageForm'

const Main = ({ isLoading, metaMask }) => (
  <Fragment>
    {isLoading ? <p styleName="loading">Loading...</p> : null}
    {!isLoading && !metaMask ? <p styleName="noMetaMask">MetaMask injection not found</p> : null}
    {!isLoading && metaMask ? <MessageForm web3={metaMask} /> : null}
  </Fragment>
)

export default compose(
  pure,
  withState('isLoading', 'setLoading', true),
  withState('metaMask', 'setMetaMask', null),
  lifecycle({
    componentDidMount() {
      window.addEventListener('load', async () => {
        const metaMask = pathOr(false, ['web3', 'currentProvider', 'isMetaMask'], window) ? new Web3(window.web3.currentProvider) : null
        const loggedIn = metaMask && await !isEmpty(metaMask.eth.getAccounts())
        this.setState({
          isLoading: false,
          metaMask: loggedIn
        })
      })
    }
  }),
  CSSModules(styles)
)(Main)