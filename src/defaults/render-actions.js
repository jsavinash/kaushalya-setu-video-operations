import React from 'react'
import PropTypes from 'prop-types'
import RecordButton from './record-button'
import StopButton from './stop-button'
import Timer from './timer'
import Countdown from './countdown'
import retryIcon from '../svg/retry.svg'
import cameraIcon from '../svg/camera.svg'
import addFileIcon from '../svg/add.svg'
import replaceFileIcon from '../svg/replace.svg'

const Actions = ({
  locales,
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
  onConfirm,
  takePicture
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
        <img
          src={useVideoInput ? replaceFileIcon : retryIcon}
          data-qa='start-replaying'
          alt={locales.retryLabel || 'retry'}
          style={{
            height: '64px',
            width: '64px'
          }}
          onClick={onStopReplaying}
        />
      )
    }

    if (isRecording) {
      return <StopButton onClick={onStopRecording} data-qa='stop-recording' />
    }

    if (isCameraOn && streamIsReady) {
      return (
        <RecordButton
          takePicture={takePicture}
          onClick={onStartRecording}
          locales={locales}
          data-qa='start-recording'
        />
      )
    }

    if (useVideoInput) {
      return (
        <img
          src={addFileIcon}
          data-qa='open-input'
          alt={locales.addFileLabel || 'add file'}
          style={{
            height: '64px',
            width: '64px'
          }}
          onClick={onOpenVideoInput}
        />
      )
    }

    return shouldUseVideoInput ? (
      <button
        className='button'
        onClick={onOpenVideoInput}
        data-qa='open-input'
      >
        {locales.recordButton || 'Record a video'}
      </button>
    ) : (
      <img
        src={cameraIcon}
        data-qa='turn-on-camera'
        alt={locales.retryLabel || 'retry'}
        style={{
          height: '64px',
          width: '64px'
        }}
        onClick={onTurnOnCamera}
      />
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
  takePicture: PropTypes.object,
  locales: PropTypes.object,
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
