import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Arrow extends Component {

  static propTypes = {
    label: PropTypes.string,
    cssClass: PropTypes.string,
    onClick: PropTypes.func
  }

  render () {
    const { label, cssClass, onClick } = this.props

    return (
      <div className={`control--wrapper ${label} ${cssClass || ''}`}>
        <div className={`control--${label}`} onClick={onClick}>
          <div className='arrow' />
        </div>
      </div>
    )
  }
}
