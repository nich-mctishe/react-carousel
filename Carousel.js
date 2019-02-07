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
    duration: 500,
    interval: 1500,
    pause: false
  }

  internalState = {
    animating: false,
    drag: false,
    autoSlide: false
  }

  initial = 1

  initialPauseSet = null

  interval = null

  xPos = null

  resetState = () => {
    this.internalState.animating = false
    this.internalState.drag = false
    this.internalState.autoSlide = false

    if (this.state.paused &&
      this.initialPauseSet === false) {
        console.log('valid');
      this.setState({ paused: false })
    }

    this.setAutoScroll()
  }

  onClick = (e) => {
    if (!this.internalState.animating) {
      if (this.initialPauseSet === false && !this.state.paused) {
        this.setState({ paused: true })
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

  handleMovement = (slider, direction) => {
    const { duration } = this.props
    const pos = this.getPosition(direction === 'previous' ? 1 : -1)

    this.setMovement( slider, pos, duration )

    // if just click
    if (!this.internalState.drag && !this.internalState.autoSlide) {
      if (
        (this.state.current === this.state.slides.length -1 && direction !== 'previous') ||
        (this.state.current === 0 && direction === 'previous')
      ) {
        this.handleSpecialMovement (
          slider,
          (direction !== 'previous') ? -1 : 1
        )
      }
      // if auto play
    } else {
      if ((this.state.current === this.state.slides.length -1 && direction !== 'previous') ||
      (this.state.current === 0 && direction === 'previous')) {
        const newCurrent = (this.state.current === 0 && direction === 'previous')
          ? this.state.slides.length - 2 : this.initial

        setTimeout(() => {
          this.setMovement (slider, - (newCurrent / this.state.slides.length) * 100, 0)
          this.setState({current: newCurrent})
        }, duration)
      }
    }
  }

  handleSpecialMovement = (slider, direction) => {
    slider.classList.add('no-animation')
    setTimeout(() => {
      this.setMovement(slider, this.getPosition(direction), this.props.duration)
    }, 1)
    setTimeout(() => {
      slider.classList.remove('no-animation')
    }, 2)
  }

  setMovement = (slider, position, duration) => {
    if (position !== null) {
      const transform = `translateX(${position}%)`
      this.internalState.animating = true

      slider.style.transitionDuration = `${duration}ms`
      slider.style.WebkitTransitionDuration = `${duration}ms`
      slider.style.transform = transform
      slider.style.WebkitTransform = transform
      slider.style.msTransform = transform

      setTimeout ( () => {
        this.resetState()
      }, duration + 10 )
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
    if (!this.state.paused && this.initialPauseSet === false) {
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.internalState.autoSlide = true
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
    this.xPos = e.screenX || e.touches[0].screenX
  }

  onDrag = (e) => {
    let startX = this.xPos
    let currentX = e.screenX || e.changedTouches[0].screenX

    if (Math.abs(startX - currentX) > 100) {
      if (startX - currentX > 0) {
        e.target.classList = 'next'
      } else {
        e.target.classList = 'previous'
      }
      this.internalState.drag = true
      this.onClick(e)
    }

    // unset x
    this.xPos = null
  }

  componentWillMount () {
    const { children } = this.props
    if (this.initialPauseSet === null) {
      this.initialPauseSet = this.props.pause
    }

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

    if (this.state.paused !== this.props.pause) {
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
    this.setMovement(
      document.querySelector('section.carousel ul.slide--deck'),
      - (this.state.current / this.state.slides.length) * 100,
      0
    )

    if (window) {
      window.addEventListener('touchstart', this.setStartX)
      window.addEventListener('touchend', this.onDrag)
    }

    this.setAutoScroll()
  }

  componentWillUpdate () {
    this.setAutoScroll()
  }

  componentWillUnmount () {
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
