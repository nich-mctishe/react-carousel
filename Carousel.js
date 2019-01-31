import React, { Component } from 'react'
import Arrow from './Arrow'
import './carousel.css'
import PropTypes from 'prop-types'

export default class Carousel extends Component {

  static propTypes = {
    arrowClass: PropTypes.string,
    arrow: PropTypes.object,
    pause: PropTypes.bool,
    start: PropTypes.number,
    direction: PropTypes.number, // 1 for reverse -1 for forward
    interval: PropTypes.number,
    duration: PropTypes.number
  }

  static defaultProps = {
    duration: 1500,
    interval: 5000,
    pause: true
  }

  initial = 1

  animating = false

  interval = null

  clickTimeout = null

  xPos = null

  onClick = (e) => {
    if (!this.animating) {
      if (!this.state.paused) {
        this.setState({ paused: true })

        this.clickTimeout = setTimeout (() => {
          this.setState({ paused: false })
        }, this.props.interval)
      }

      const classList = e.target.classList
      const slider = e.view.document.querySelector('section.carousel ul.slide--deck')

      this.handleMovement(slider,
        classList.value.includes('previous') ? 'previous' : 'next'
      )
    }
  }

  state = {
    slides: [],
    arrows: {
      previous: (<Arrow label="previous" cssClass={this.props.arrowClass} onClick={this.onClick} />),
      next: (<Arrow label="next" cssClass={this.props.arrowClass} onClick={this.onClick} />)
    },
    paused: false,
    current: 1,
    customArrow: false
  }

  carouselRef = React.createRef()

  windowRef = React.createRef()

  // may need a handle movement command
  handleMovement = (slider, direction) => {
    this.setMovement(
      slider,
      this.getPosition(direction === 'previous' ? 1 : -1)
    )

    //console.log(this.state.current);

    if (this.state.current === this.state.slides.length -1 && direction !== 'previous') {
      this.handleSpecialMovement (slider, -1)
    }

    if (this.state.current === 0 && direction === 'previous') {
      this.handleSpecialMovement (slider, 1)
    }
  }

  handleSpecialMovement = (slider, direction) => {
    slider.classList.add('no-animation')
    setTimeout(() => {
      this.setMovement(slider, this.getPosition(direction))
    }, 1)
    setTimeout(() => {
      slider.classList.remove('no-animation')
    }, 2)
  }

  handleInitialMovement = (slider, pos) => {
    const position = - ( pos / this.state.slides.length) * 100
    const transform = `translateX(${position}%)`

    slider.classList.add('no-animation')
    slider.style.transform = transform
    slider.style.WebkitTransform = transform
    slider.style.msTransform = transform

    setTimeout(() => {
      slider.classList.remove('no-animation')
    }, 2)
  }

  setMovement = (slider, position) => {
    const { duration } = this.props

    if (position !== null) {
      const transform = `translateX(${position}%)`
      this.animating = true

      slider.style.transitionDuration = `${duration}ms`
      slider.style.WebkitTransitionDuration = `${duration}ms`
      slider.style.transform = transform
      slider.style.WebkitTransform = transform
      slider.style.msTransform = transform

      setTimeout(() => {
        this.animating = false
      }, duration)

    }
  }

  getPosition = (intended) => {
    let currentPosition = this.state.current

    if (intended === 1) {
      currentPosition--
    }

    if (intended === -1) {
      currentPosition++
    }

    console.log(this.state.slides.length);

    currentPosition = (
      (intended === -1 && currentPosition > 0 && currentPosition < this.state.slides.length) ||
      (intended === 1 && currentPosition >= 0 && currentPosition <= this.state.slides.length -1)
    )
      ? currentPosition
      : (currentPosition < 0) ? this.state.slides.length - 1 : 1

    this.setState({ current: currentPosition })

    return  - (currentPosition / this.state.slides.length) * 100
  }

  setAutoScroll = () => {
    if (!this.state.paused) {
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.handleMovement(
              document.querySelector('section.carousel ul.slide--deck'),
              this.props.direction === 1 ? 'previous' : 'next')
        }, this.props.interval)
      }
    } else {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    }
  }

  setStartX = (e) => {
    this.xPos = e.screenX

    console.log(this.xPos);
  }

  onDrag = (e) => {
    let startX = this.xPos
    let currentX = e.screenX

    if (Math.abs(startX - currentX) > 100) {
      if (startX - currentX > 0) {
        console.log('drag 1');
      } else {
        console.log('drag 2');
      }

      this.onClick(e)
    }

    // unset x
    this.xPos = null
  }

  componentWillMount () {
    const { children } = this.props

    if (children.length !== this.state.slides.length) {
      const initial = children[0]
      const last = children[children.length - 1]
      let slides = children.map(child => {
        return child
      })
      // add the 1st slide last and the last slide first
      slides.push(initial)
      slides.unshift(last)

      this.setState({ slides: slides })
    }

    if (this.props.arrow && !this.state.customArrow) {
      this.setState({
        arrows: {
          previous: (<this.props.arrow label="previous" onClick={this.onClick} />),
          next: (<this.props.arrow label="next" onClick={this.onClick} />)
        },
        customArrow: true
      })
    }

    if (this.props.pause && this.state.paused !== this.props.pause) {
      this.setState({
        paused: this.props.pause
      })
    }

    if (this.props.start && this.props.start !== this.state.start) {
      this.initial = this.props.start

      this.setState({
        current: this.props.start
      })
    }
  }

  componentDidMount () {
    this.handleInitialMovement(
      document.querySelector('section.carousel ul.slide--deck'),
      this.state.current
    )

    if (window) {
      //window.addEventListener('resize', this.resizeSlides)

      window.addEventListener('mousedown', this.setStartX)
      window.addEventListener('mouseup', this.onDrag)
      window.addEventListener('touchstart', this.setStartX)
      window.addEventListener('touchend', this.onDrag)
    }

    this.setAutoScroll()
  }

  componentWillUpdate () {
    this.setAutoScroll()
  }

  componentWillUnmount () {
    // window.removeEventListener('resize', this.resizeSlides)
    window.removeEventListener('mousedown', this.setStartX)
    window.removeEventListener('mouseup', this.onDrag)
    window.removeEventListener('touchstart', this.setStartX)
    window.removeEventListener('touchend', this.onDrag)
  }

  render () {
    const { slides, arrows } = this.state

    return (
      <section className="carousel">
        <div className="carousel--window" ref={this.windowRef}>
          <ul
            className={`slide--deck`}
            ref={this.slideDeckRef}
            style={{ width: `${this.state.slides.length * 100}%` }}>
            {slides}
          </ul>
        </div>
        <div className="carousel--controls">
          {arrows.previous && (arrows.previous)}
          {arrows.next && (arrows.next)}
        </div>
      </section>
    )
  }

}
