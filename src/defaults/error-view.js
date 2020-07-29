import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from './close-button'

const ErrorView = props => (
  <div className='error-message'>
    <CloseButton onClick={props.onClick} />
    {props.locales.recordFailLabel ||
      'Oh snap! Your browser failed to record your video.'}
    <br />
    <br />
    {props.locales.tryRecordingAgainLabel || 'Please restart it and try again'}
  </div>
)

// prop types
ErrorView.propTypes = {
  locales: PropTypes.object,
  onClick: PropTypes.func
}

// default props
ErrorView.defaultProps = {
  locales: {},
  onClick: () => ({})
}

export default ErrorView
