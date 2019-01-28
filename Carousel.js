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
    interval: PropTypes.number
  }

  state = {
    slides: [],
    arrows: {
      previous: (<Arrow label="previous" cssClass={this.props.arrowClass} onClick={this.onClick} />),
      next: (<Arrow label="next" cssClass={this.props.arrowClass} onClick={this.onClick}/>)
    },
    paused: false,
    current: 0,
    customArrow: false
  }

  carouselRef = React.createRef()

  slideDeckRef = React.createRef()

  windowRef = React.createRef()

  onClick = e => {
    const classList = e.target.classList
    const slider = e.view.document.querySelector('section.carousel ul.slide--deck')

    this.setMovement(
      slider,
      this.getPosition(classList.value.includes('previous') ? 1 : -1)
    )

  }

  setMovement = (slider, position) => {
    if (position !== null) {
      const transform = `translateX(${position}%)`

      slider.style.transform = transform
      slider.style.WebkitTransform = transform
      slider.style.msTransform = transform
    }
  }

  getPosition = (intended) => {
    let currentPosition = this.state.current

    console.log(currentPosition);

    if (intended === 1) {
      currentPosition--
    }

    if (intended === -1) {
      currentPosition++
    }

    currentPosition = (currentPosition > 0 && currentPosition < this.state.slides.length -1)
        ? currentPosition
        : (currentPosition < 0 ) ? this.state.slides.length - 1 : 1

    this.setState({ current: currentPosition })

    return  - (currentPosition / this.state.slides.length) * 100
  }

  inferWidth = (slides) => {
    // slides * container width
    return slides.length * this.windowRef.current.clientWidth + 'px'
  }

  resizeSlides = () => {
    const { slides } = this.state

    this.slideDeckRef.current.style.width = this.inferWidth(slides)
  }

  setAutoScroll = () => {
    if (!this.state.paused) {
      setTimeout(() => {
        this.setMovement(
          document.querySelector('section.carousel ul.slide--deck'),
          this.getPosition(this.props.direction || -1)
        )
      }, this.props.interval * 1000 || 1000)
    }
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

    if (this.props.pause && this.state.paused !== this.this.props.pause) {
      this.setState({
        paused: this.props.pause
      })
    }

    if (this.props.start && this.props.start !== this.state.start) {
      this.setState({ start: this.props.start })
    }
  }

  componentDidMount () {
    this.resizeSlides()

    if (window) {
      window.addEventListener('resize', this.resizeSlides)
    }

    this.setAutoScroll()
  }

  componentWillUpdate () {
    this.setAutoScroll()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeSlides)
  }

  render () {
    const { slides, arrows, current } = this.state

    return (
      <section className="carousel">
        <div className="carousel--window" ref={this.windowRef}>
          <ul className={`slide--deck ${current === slides.length - 1 ? 'no-animation' : ''}`} ref={this.slideDeckRef}>
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
