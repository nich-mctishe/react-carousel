import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/carousel.css'

export default class Slide extends Component {
  /**
   * @var {Object} propTypes
   */
  static propTypes = {
    onClick: PropTypes.func
  }
  /**
   * @var {Object} defaultProps
   */
  static defaultProps = {
    onClick: () => {
      console.warn('click event fired, but there is nothing to click. try passing an event in to the relevant slide');
    }
  }
  /**
   * @var {Function} onClick
   * passed in onClick event defaults to standard
   */
  onClick = this.props.onClick
  /**
   * @var {Function} render
   *
   * @returns {JSX}
   */
  render () {

    return (
      <div className={`${styles.carouselSlide} c--slide`} onClick={this.onClick}>
        {this.props.children}
      </div>
    )
  }
}
