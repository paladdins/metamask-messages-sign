import React, { Component } from 'react'
import logo from './logo.svg'
import styles from './styles.module.scss'
import Main from '../Main'

export default class App extends Component {
  render() {
    return (
      <div className={styles.App}>
        <header className={styles.AppHeader}>
          <img src={logo} className={styles.AppLogo} alt="logo" />
          <p>
            MetaMask sign messages demo
          </p>
        </header>
        <Main />
      </div>
    );
  }
}
