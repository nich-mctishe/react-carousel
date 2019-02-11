import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Slide extends Component {

  static propTypes = {
    onClick: PropTypes.func
  }

  static defaultProps = {
    onClick: () => {
      console.warn('click event fired, but there is nothing to click. try passing an event in to the relevant slide');
    }
  }

  onClick = this.props.onClick

  render () {

    return (
      <li className="carousel--slide" onClick={this.onClick}>
        {this.props.children}
      </li>
    )
  }
}
