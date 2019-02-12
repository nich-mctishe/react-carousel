import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/carousel.css'

export default class Arrow extends Component {

  static propTypes = {
    label: PropTypes.string,
    cssClass: PropTypes.string,
    onClick: PropTypes.func
  }

  render () {
    const { label, cssClass, onClick } = this.props

    return (
      <div className={`${styles.controlWrapper} ${label} ${cssClass || ''}`}>
        <div className={styles['control' + label]} onClick={onClick}>
          <div className={`${styles.arrow} ${label}`} />
        </div>
      </div>
    )
  }
}
