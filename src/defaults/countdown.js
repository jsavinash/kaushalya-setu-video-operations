import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Countdown extends Component {
  static propTypes = {
    countdownTime: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.state = {
      number: props.countdownTime / 1000
    }
  }

  componentDidMount () {
    this.timeout = setTimeout(this.updateNumber, 1000)
  }

  componentWillUnmount () {
    clearInterval(this.timeout)
  }

  updateNumber = () => {
    const nextNumber = this.state.number - 1
    this.setState({
      number: nextNumber
    })
    if (nextNumber !== 0) {
      this.timeout = setTimeout(this.updateNumber, 1000)
    }
  }

  render () {
    return (
      <div className='countdown'>
        {this.state.number !== 0 ? this.state.number : null}
      </div>
    )
  }
}
