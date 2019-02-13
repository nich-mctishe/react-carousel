import React, { Component } from 'react'
import Arrow from './Arrow'
import styles from '../styles/carousel.css'
import PropTypes from 'prop-types'
import { format, luminance } from './helpers'

export default class Carousel extends Component {
  /**
   * @var {Object} propTypes
   */
  static propTypes = {
    arrowClass: PropTypes.string,
    arrow: PropTypes.object,
    pause: PropTypes.bool,
    start: PropTypes.number,
    direction: PropTypes.number, // 1 for reverse -1 for forward
    interval: PropTypes.number,
    duration: PropTypes.number,
    backgrounds: PropTypes.array,
    cssName: PropTypes.string
  }
  /**
   * @var {Object} defaultProps
   */
  static defaultProps = {
    duration: 500,
    interval: 1500,
    pause: false
  }
  /**
   * @var {Object} internalState
   * anything that doesnt need to be passed to render
   */
  internalState = {
    animating: false,
    drag: false,
    autoSlide: false
  }
  /**
   * @var {Number} initial
   * the position of the initial slide
   */
  initial = 1
  /**
   * @var {Boolean|null} initialPauseSet
   * persist whether pause was set on init (as a prop, pre change) or not.
   */
  initialPauseSet = null
  /**
   * @var {Function|null} interval
   * contains the setInterval function for management.
   */
  interval = null
  /**
   * @var {Number|null} xPos
   * the start of the last drag point
   */
  xPos = null
  /**
   * @var {function} resetState
   * at the end of the transition, this function ensures all internal
   * and render states are reset to init.
   * @returns {void}
   */
  resetState = () => {
    this.internalState.animating = false
    this.internalState.drag = false
    this.internalState.autoSlide = false

    if (this.state.paused &&
      this.initialPauseSet === false) {
        this.setState({ paused: false })
    }

    this.setAutoScroll()
  }
  /**
   * @var {function} onClick
   * @param {Object} e = passed in event
   * event handles clicks and drag results.
   * @returns {void}
   */
  onClick = (e) => {
    if (!this.internalState.animating) {
      if (this.initialPauseSet === false && !this.state.paused) {
        this.setState({ paused: true })
      }

      const classList = e.target.classList
      const slider = this.windowRef.current.querySelector('ul')

      this.handleMovement(slider,
        classList.value.includes('previous') ? 'previous' : 'next'
      )
    }
  }
  /**
   * @var {Object} state
   */
  state = {
    slides: [],
    backgrounds: [],
    arrows: {
      previous: (<Arrow label="previous" cssClass={this.props.arrowClass} onClick={this.onClick} />),
      next: (<Arrow label="next" cssClass={this.props.arrowClass} onClick={this.onClick} />)
    },
    paused: false,
    current: 1,
    customArrow: false
  }
  /**
   * @var {Object} windowRef
   * the carousels ref for manipulation
   */
  windowRef = React.createRef()
  /**
   * @var {Function} handleMovement
   * handles any request for slide transition
   * @param {Object{Slide}} slider = the dom slides
   * @param {Number} direction = determines direction based on 1 or -1
   *
   * @returns {void}
   */
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
  /**
   * @var {Function} handleMovement
   * handles click request for end or start of slide transition (w/o animation)
   * @param {Object{Slide}} slider = the dom slides
   * @param {Number} direction = determines direction based on 1 or -1
   *
   * @returns {void}
   */
  handleSpecialMovement = (slider, direction) => {
    slider.classList.add(styles.noAnimation)
    setTimeout(() => {
      this.setMovement(slider, this.getPosition(direction), this.props.duration)
    }, 1)
    setTimeout(() => {
      slider.classList.remove(styles.noAnimation)
    }, 5)
  }
  /**
   * @var {Function} setMovement
   * performs css animation action
   * @param {Object{Slide}} slider = the dom slides
   * @param {Number} position = percentage through slider to next frame
   * @param {Number} duration = the time the transition will take
   *
   * @returns {void}
   */
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
  /**
   * @var {Function} getPosition
   * determines where in the slide deck the next position should be
   * @var {Number} intended = whether the slide is going backwards or forwards
   *
   * @returns {Number}
   */
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
      : (currentPosition < 0) ? this.state.slides.length - 2 : 1

    this.setState({ current: currentPosition })

    return  - (currentPosition / this.state.slides.length) * 100
  }
  /**
   * @var {Function} setAutoScroll
   * sets or removes the interval function for autoscroll if required
   *
   * @returns {void}
   */
  setAutoScroll = () => {
    if (!this.state.paused && this.initialPauseSet === false) {
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.internalState.autoSlide = true
          this.handleMovement(
              this.windowRef.current.querySelector('ul'),
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
  /**
   * @var {Function} setStartX
   * Determines drag start position
   * @param {Object} e = event
   *
   * @returns {void}
   */
  setStartX = (e) => {
    this.xPos = e.screenX || e.touches[0].screenX
  }
  /**
   * @var {Function} onDrag
   * trigger for mobile touch events
   * @param {Object} e = event
   *
   * @returns {void}
   */
  onDrag = (e) => {
    let startX = this.xPos
    let currentX = e.screenX || e.changedTouches[0].screenX

    console.log(e);

    if (Math.abs(startX - currentX) > 100) {
      e.target.classList.remove('next', 'previous')

      if (startX - currentX > 0) {
        e.target.classList.add('next')
      } else {
        e.target.classList.add('previous')
      }
      this.internalState.drag = true
      this.onClick(e)
    }

    // unset x
    this.xPos = null
  }
  /**
   * @var {Function} componentWillMount
   *
   * @returns {void}
   */
  componentWillMount () {
    const { children, backgrounds } = this.props
    if (this.initialPauseSet === null) {
      this.initialPauseSet = this.props.pause
    }

    if (children.length !== this.state.slides.length) {
      let newState = {
        slides: format.array(children)
      }

      if (backgrounds) {
        newState.backgrounds = format.array(backgrounds)
      }

      this.setState(newState)
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
  /**
   * @var {Function} componentDidMount
   *
   * @returns {void}
   */
  componentDidMount () {
    if (this.props.start >= this.state.slides.length) {
      this.initial = this.state.slides.length -1
    }

    this.setMovement(
      this.windowRef.current.querySelector('ul'),
      - (this.state.current / this.state.slides.length) * 100,
      0
    )

    if (window) {
      window.addEventListener('touchstart', this.setStartX)
      window.addEventListener('touchend', this.onDrag)
    }

    this.setAutoScroll()
  }
  /**
   * @var {Function} componentWillUpdate
   *
   * @returns {void}
   */
  componentWillUpdate () {
    this.setAutoScroll()
  }
  /**
   * @var {Function} componentWillUnmount
   *
   * @returns {void}
   */
  componentWillUnmount () {
    window.removeEventListener('touchstart', this.setStartX)
    window.removeEventListener('touchend', this.onDrag)
  }
  /**
   * @var {Function} render
   *
   * @returns {JSX}
   */
  render () {
    const { slides, arrows } = this.state
    const { cssName } = this.props

    return (
      <section className={`${styles.carousel} ${cssName || ''}`}>
        <div className={styles.carouselWindow} ref={this.windowRef}>
          <ul
            className={`${styles.slideDeck} c--slides`}
            style={{ width: `${this.state.slides.length * 100}%` }}>
            {slides.map((slide, i) => (<li key={i}>{slide}</li>))}
          </ul>
        </div>
        <div className={`${styles.carouselControls} c--controls ${luminance.check(this.state.backgrounds[this.state.current])}`}>
          {arrows.previous && (arrows.previous)}
          {arrows.next && (arrows.next)}
        </div>
      </section>
    )
  }
}
