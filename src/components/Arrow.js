import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/carousel.css'

export default class Arrow extends Component {
  /**
   * @var {Object} propTypes
   */
  static propTypes = {
    label: PropTypes.string,
    cssClass: PropTypes.string,
    onClick: PropTypes.func
  }
  /**
   * @var {Function} render
   *
   * @returns {JSX}
   */
  render () {
    const { label, cssClass, onClick } = this.props

    return (
      <div className={`${styles.controlWrapper} ${label} ${cssClass || ''}`}>
        <div className={`${styles['control' + label]} c--arrow--wrapper`} onClick={onClick}>
          <div className={`${styles.arrow} c--arrow ${label}`} />
        </div>
      </div>
    )
  }
}
