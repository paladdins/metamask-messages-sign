import React from 'react'
import CSSModules from 'react-css-modules'
import { compose, pure, withStateHandlers, lifecycle, withHandlers } from 'recompose'
import { reverse } from 'ramda'
import delay from 'nanodelay'
import styles from './styles.module.scss'

const errors = {
  signPlease: 'You need to sign message before sending',
  notEmpty: 'Your message could not be empty'
}

const getMessageSign = (account, msg) => {
  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: msg
    }
  ]
  return new Promise(res => {
    window.web3.currentProvider.sendAsync({
      method: 'eth_signTypedData',
      params: [msgParams, account],
      from: account
    }, (err, result) => {
      if (result.result) res(result.result)
      else res(null)
    })
  })
}

const MessageForm = ({ web3, messages, text, onSubmit, onTextInput, address, error }) => (
  <div styleName="block">
    <div styleName="messagesContainer">
      {reverse(messages).map(({ message, sign }, i) => (
        <div
          styleName="message"
          key={i}
        >
          <p><b>Message:</b> {message}</p>
          <p><b>Sign:</b> {sign}</p>
        </div> 
      ))}
    </div>
    <form onSubmit={onSubmit} styleName="messageForm">
      <div styleName="currentWallet">
        Your chosen wallet is {<code>{address}</code> || '...'}
      </div>
      <textarea onChange={onTextInput} value={text} />
      <div styleName="btnBlock">
        <button type="submit">Submit message</button>
        <span styleName="error">{error}</span>
      </div>
    </form>
  </div>
)

export default compose(
  pure,
  withStateHandlers(
    {
      messages: [],
      text: '',
      error: null,
      address: null
    },
    {
      onTextInput: () => ({ target: { value } }) => ({ text: value }),
      resetTextInput: () => () => ({ text: '' }),
      addMessage: ({ messages, text }) => sign => ({ messages: [...messages, { message: text, sign }] }),
      setError: () => error => ({ error }),
      resetError: () => () => ({ error: null })
    }
  ),
  withHandlers({
    processSubmit: ({ web3, text }) => account => getMessageSign(account, text)
  }),
  withHandlers({
    onSubmit: ({ processSubmit, addMessage, resetTextInput, web3, setError, resetError, defaultAccount, text }) => async e => {
      e.preventDefault()
      if (!text) return setError(errors.notEmpty)
      const sign = await processSubmit(defaultAccount).catch(err => console.error(err))
      if (sign !== null) {
        addMessage(sign)
        resetTextInput()
        resetError()
      } else {
        setError(errors.signPlease)
      }
    }
  }),
  lifecycle({
    componentWillMount() {
      const address = window.web3.currentProvider.selectedAddress
      this.setState({ address })
    }
  }),
  CSSModules(styles)
)(MessageForm)
