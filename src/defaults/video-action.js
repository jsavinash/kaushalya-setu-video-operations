import React from 'react'
import PropTypes from 'prop-types'
import closeIcon from '../svg/close.svg'
import correctIcon from '../svg/correct.svg'

const VideoCaptureAction = props => {
  const { isRecording, onVideoPlayerClose, onVideoPlayerDone } = props

  return (
    <>
      <div className='cancel-button-wrapper'>
        <img
          src={closeIcon}
          data-qa='btn'
          className='cancel-btn'
          alt='cancel'
          onClick={onVideoPlayerClose}
        />
      </div>
      {isRecording && (
        <div className='save-button-wrapper'>
          <img
            src={correctIcon}
            className='save-btn'
            data-qa='btn'
            alt='correct'
            onClick={onVideoPlayerDone}
          />
        </div>
      )}
    </>
  )
}

// prop types
VideoCaptureAction.propTypes = {
  isRecording: PropTypes.bool,
  onVideoPlayerClose: PropTypes.func,
  onVideoPlayerDone: PropTypes.func
}

// default props
VideoCaptureAction.defaultProps = {
  isRecording: false,
  onVideoPlayerClose: () => ({}),
  onVideoPlayerDone: () => ({})
}

export default VideoCaptureAction
