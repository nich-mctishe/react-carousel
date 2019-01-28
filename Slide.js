import React, { Component } from 'react'

export default class Slide extends Component {

  onClick = () => {
    console.log('clicked');
  }

  render () {

    return (
      <li className="carousel--slide" onClick={this.onClick}>
        {this.props.children}
      </li>
    )
  }
}
