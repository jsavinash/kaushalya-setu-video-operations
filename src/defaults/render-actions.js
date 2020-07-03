import React from 'react'
import PropTypes from 'prop-types'
import RecordButton from './record-button'
import StopButton from './stop-button'
import Timer from './timer'
import Countdown from './countdown'

const Actions = ({
  isVideoInputSupported,
  isInlineRecordingSupported,
  thereWasAnError,
  isRecording,
  isCameraOn,
  streamIsReady,
  isConnecting,
  isRunningCountdown,
  isReplayingVideo,
  countdownTime,
  timeLimit,
  showReplayControls,
  replayVideoAutoplayAndLoopOff,
  useVideoInput,

  onTurnOnCamera,
  onTurnOffCamera,
  onOpenVideoInput,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onStopReplaying,
  onConfirm
}) => {
  const renderContent = () => {
    const shouldUseVideoInput =
      !isInlineRecordingSupported && isVideoInputSupported

    if (
      (!isInlineRecordingSupported && !isVideoInputSupported) ||
      thereWasAnError ||
      isConnecting ||
      isRunningCountdown
    ) {
      return null
    }

    if (isReplayingVideo) {
      return (
        <button
          className='button'
          onClick={onStopReplaying}
          data-qa='start-replaying'
        >
          Use another video
        </button>
      )
    }

    if (isRecording) {
      return <StopButton onClick={onStopRecording} data-qa='stop-recording' />
    }

    if (isCameraOn && streamIsReady) {
      return (
        <RecordButton onClick={onStartRecording} data-qa='start-recording' />
      )
    }

    if (useVideoInput) {
      return (
        <button
          className='button'
          onClick={onOpenVideoInput}
          data-qa='open-input'
        >
          Upload a video
        </button>
      )
    }

    return shouldUseVideoInput ? (
      <button
        className='button'
        onClick={onOpenVideoInput}
        data-qa='open-input'
      >
        Record a video
      </button>
    ) : (
      <button
        className='button'
        onClick={onTurnOnCamera}
        data-qa='turn-on-camera'
      >
        Turn my camera ON
      </button>
    )
  }

  return (
    <div>
      {isRecording && <Timer timeLimit={timeLimit} />}
      {isRunningCountdown && <Countdown countdownTime={countdownTime} />}
      <div className='action-wrapper'>{renderContent()}</div>
    </div>
  )
}

Actions.propTypes = {
  isVideoInputSupported: PropTypes.bool,
  isInlineRecordingSupported: PropTypes.bool,
  thereWasAnError: PropTypes.bool,
  isRecording: PropTypes.bool,
  isCameraOn: PropTypes.bool,
  streamIsReady: PropTypes.bool,
  isConnecting: PropTypes.bool,
  isRunningCountdown: PropTypes.bool,
  countdownTime: PropTypes.number,
  timeLimit: PropTypes.number,
  showReplayControls: PropTypes.bool,
  replayVideoAutoplayAndLoopOff: PropTypes.bool,
  isReplayingVideo: PropTypes.bool,
  useVideoInput: PropTypes.bool,

  onTurnOnCamera: PropTypes.func,
  onTurnOffCamera: PropTypes.func,
  onOpenVideoInput: PropTypes.func,
  onStartRecording: PropTypes.func,
  onStopRecording: PropTypes.func,
  onPauseRecording: PropTypes.func,
  onResumeRecording: PropTypes.func,
  onStopReplaying: PropTypes.func,
  onConfirm: PropTypes.func
}

export default Actions
