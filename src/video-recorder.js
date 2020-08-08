import './css/App.css'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import UnsupportedView from './defaults/unsupported-view'
import ErrorView from './defaults/error-view'
import DisconnectedView from './defaults/disconnected-view'
import LoadingView from './defaults/loading-view'
import renderActions from './defaults/render-actions'
import VideoCaptureAction from './defaults/video-action'
import getVideoInfo, { captureThumb } from './get-video-info'
import {
  ReactVideoRecorderDataIssueError,
  ReactVideoRecorderRecordedBlobsUnavailableError,
  ReactVideoRecorderDataAvailableTimeoutError,
  ReactVideoRecorderMediaRecorderUnavailableError
} from './custom-errors'

const MIME_TYPES = [
  'video/webm;codecs="vp8,opus"',
  'video/webm;codecs=h264',
  'video/webm;codecs=vp9',
  'video/webm'
]

const PICTURE_TYPES = ['image/webp', 'image/png', 'image/jpeg']

const CONSTRAINTS = {
  audio: true,
  video: true
}

export default class VideoRecorder extends Component {
  static propTypes = {
    videoUrl: PropTypes.string,
    /** full screen flag */
    showCloseButton: PropTypes.bool,
    /** full screen flag */
    isFullScreen: PropTypes.bool,
    /** Text translation */
    locales: PropTypes.object,
    /** Whether or not to start the camera initially */
    isOnInitially: PropTypes.bool,
    /** Whether or not to display the video flipped (makes sense for user facing camera) */
    isFlipped: PropTypes.bool,
    /** Pass this if you want to force a specific mime-type for the video */
    mimeType: PropTypes.string,
    /** How much time to wait until it starts recording (in ms) */
    countdownTime: PropTypes.number,
    /** Use this if you want to set a time limit for the video (in ms) */
    timeLimit: PropTypes.number,
    /** Use this if you want to show play/pause/etc. controls on the replay video */
    showReplayControls: PropTypes.bool,
    /** Use this to turn off autoplay and looping of the replay video. It is recommended to also showReplayControls in order to play */
    replayVideoAutoplayAndLoopOff: PropTypes.bool,
    /** Use this for picture config */
    takePicture: PropTypes.shape({
      screenshotFormat: PropTypes.oneOf(PICTURE_TYPES),
      screenshotQuality: PropTypes.number,
      forceScreenshotSourceSize: PropTypes.bool,
      minScreenshotWidth: PropTypes.number,
      minScreenshotHeight: PropTypes.number,
      mirrored: PropTypes.bool,
      imageSmoothing: PropTypes.bool,
      width: PropTypes.number,
      height: PropTypes.number
    }),
    /** Use this if you want to customize the constraints passed to getUserMedia() */
    constraints: PropTypes.shape({
      audio: PropTypes.any,
      video: PropTypes.any
    }),
    chunkSize: PropTypes.number,
    dataAvailableTimeout: PropTypes.number,
    useVideoInput: PropTypes.bool,

    renderDisconnectedView: PropTypes.func,
    renderLoadingView: PropTypes.func,
    renderVideoInputView: PropTypes.func,
    renderUnsupportedView: PropTypes.func,
    renderErrorView: PropTypes.func,
    renderActions: PropTypes.func,

    onGetScreenshot: PropTypes.func,
    onCameraOn: PropTypes.func,
    onTurnOnCamera: PropTypes.func,
    onTurnOffCamera: PropTypes.func,
    onStartRecording: PropTypes.func,
    onStopRecording: PropTypes.func,
    onPauseRecording: PropTypes.func,
    onResumeRecording: PropTypes.func,
    onRecordingComplete: PropTypes.func,
    onOpenVideoInput: PropTypes.func,
    onStopReplaying: PropTypes.func,
    onVideoPlayerClose: PropTypes.func,
    onVideoPlayerDone: PropTypes.func,
    onError: PropTypes.func
  }

  static defaultProps = {
    videoUrl: '',
    takePicture: null,
    showCloseButton: false,
    isFullScreen: false,
    locales: {},
    renderUnsupportedView: props => <UnsupportedView {...props} />,
    renderErrorView: props => <ErrorView {...props} />,
    renderVideoInputView: ({ videoInput }) => <>{videoInput}</>,
    renderDisconnectedView: () => <DisconnectedView />,
    renderLoadingView: props => <LoadingView {...props} />,
    renderActions,
    isFlipped: true,
    countdownTime: 3000,
    constraints: CONSTRAINTS,
    chunkSize: 250,
    dataAvailableTimeout: 500
  }

  videoInput = React.createRef()

  timeSinceInactivity = 0

  state = {
    isScreenCapture: false,
    isRecording: false,
    isCameraOn: false,
    isConnecting: false,
    isReplayingVideo: false,
    isReplayVideoMuted: true,
    thereWasAnError: false,
    error: null,
    streamIsReady: false,
    isInlineRecordingSupported: null,
    isVideoInputSupported: null,
    stream: undefined,
    isRecordingDone: false,
    isPictureCapture: false,
    capturedData: ''
  }

  componentDidMount () {
    const isInlineRecordingSupported =
      !!window.MediaSource && !!window.MediaRecorder && !!navigator.mediaDevices

    const isVideoInputSupported =
      document.createElement('input').capture !== undefined

    if (isInlineRecordingSupported) {
      this.mediaSource = new window.MediaSource()
    }

    this.setState(
      {
        isInlineRecordingSupported,
        isVideoInputSupported
      },
      () => {
        if (this.props.useVideoInput && this.props.isOnInitially) {
          this.handleOpenVideoInput()
        } else if (
          this.state.isInlineRecordingSupported &&
          this.props.isOnInitially
        ) {
          this.turnOnCamera()
        } else if (
          this.state.isVideoInputSupported &&
          this.props.isOnInitially
        ) {
          this.handleOpenVideoInput()
        }
      }
    )
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      this.replayVideo &&
      this.state.isReplayingVideo &&
      !prevState.isReplayingVideo
    ) {
      this.tryToUnmuteReplayVideo()
    }
  }

  componentWillUnmount () {
    this.turnOffCamera()
  }

  turnOnCamera = () => {
    if (this.props.onTurnOnCamera) {
      this.props.onTurnOnCamera()
    }

    this.setState({
      isConnecting: true,
      isReplayingVideo: false,
      thereWasAnError: false,
      error: null
    })

    const fallbackContraints = {
      audio: true,
      video: true
    }

    navigator.mediaDevices
      .getUserMedia(this.props.constraints)
      .catch(err => {
        // there's a bug in chrome in some windows computers where using `ideal` in the constraints throws a NotReadableError
        if (
          err.name === 'NotReadableError' ||
          err.name === 'OverconstrainedError'
        ) {
          console.warn(
            `Got ${
              err.name
            }, trying getUserMedia again with fallback constraints`
          )
          return navigator.mediaDevices.getUserMedia(fallbackContraints)
        }
        throw err
      })
      .then(this.handleSuccess)
      .catch(this.handleError)
  }

  turnOffCamera = () => {
    if (this.props.onTurnOffCamera) {
      this.props.onTurnOffCamera()
    }

    this.stream && this.stream.getTracks().forEach(stream => stream.stop())
    this.setState({
      isCameraOn: false
    })
    clearInterval(this.inactivityTimer)
  }

  handleSuccess = stream => {
    this.stream = stream
    this.setState({
      isCameraOn: true,
      stream: stream
    })
    if (this.props.onCameraOn) {
      this.props.onCameraOn()
    }

    if (window.URL) {
      this.cameraVideo.srcObject = stream
    } else {
      this.cameraVideo.src = stream
    }

    // there is probably a better way
    // but this makes sure the start recording button
    // gives the stream a couple miliseconds to be ready
    setTimeout(() => {
      this.setState(
        {
          isConnecting: false,
          streamIsReady: true
        },
        () => {
          if (!this.props.takePicture) {
            this.handleStartRecording()
          } else {
            this.setState({
              isScreenCapture: true
            })
          }
        }
      )
    }, 200)
  }

  handleError = err => {
    const { onError } = this.props

    console.error('Captured error', err)

    clearTimeout(this.timeLimitTimeout)

    if (onError) {
      onError(err)
    }

    this.setState({
      isConnecting: this.state.isConnecting && false,
      isRecording: false,
      thereWasAnError: true,
      error: err
    })

    if (this.state.isCameraOn) {
      this.turnOffCamera()
    }
  }

  handleDataIssue = event => {
    const error = new ReactVideoRecorderDataIssueError(event)
    console.error(error.message, event)
    this.handleError(error)
    return false
  }

  getMimeType = () => {
    if (this.props.mimeType) {
      return this.props.mimeType
    }

    const mimeType = window.MediaRecorder.isTypeSupported
      ? MIME_TYPES.find(window.MediaRecorder.isTypeSupported)
      : 'video/webm'

    return mimeType || ''
  }

  isDataHealthOK = event => {
    if (!event.data) return this.handleDataIssue(event)

    const { chunkSize } = this.props

    const dataCheckInterval = 2000 / chunkSize

    // in some browsers (FF/S), data only shows up
    // after a certain amount of time ~everyt 2 seconds
    const blobCount = this.recordedBlobs.length
    if (blobCount > dataCheckInterval && blobCount % dataCheckInterval === 0) {
      const blob = new window.Blob(this.recordedBlobs, {
        type: this.getMimeType()
      })
      if (blob.size <= 0) return this.handleDataIssue(event)
    }

    return true
  }

  tryToUnmuteReplayVideo = () => {
    const video = this.replayVideo
    video.muted = false

    const playPromise = video.play()
    if (!playPromise) {
      video.muted = true
      return
    }

    playPromise
      .then(() => {
        this.setState({ isReplayVideoMuted: false })
        // fixes bug where seeking control during autoplay is not available until the video is almost completely played through
        if (this.props.replayVideoAutoplayAndLoopOff) {
          video.pause()
          video.loop = false
        }
      })
      .catch(err => {
        console.warn('Could not autoplay replay video', err)
        video.muted = true
        return video.play()
      })
      .catch(err => {
        console.warn('Could play muted replay video after failed autoplay', err)
      })
  }

  handleDataAvailable = event => {
    if (this.isDataHealthOK(event)) {
      this.recordedBlobs.push(event.data)
    }
  }

  handleStopRecording = () => {
    if (this.props.onStopRecording) {
      this.props.onStopRecording()
    }

    if (!this.mediaRecorder) {
      this.handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    this.mediaRecorder.stop()
  }

  handlePauseRecording = () => {
    if (this.props.onPauseRecording) {
      this.props.onPauseRecording()
    }

    if (!this.mediaRecorder) {
      this.handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    this.mediaRecorder.pause()
  }

  handleResumeRecording = () => {
    if (this.props.onResumeRecording) {
      this.props.onResumeRecording()
    }

    if (!this.mediaRecorder) {
      this.handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    this.mediaRecorder.resume()
  }

  handleStartRecording = () => {
    if (this.props.takePicture) {
      this.handleScreenshot()
    } else {
      if (this.props.onStartRecording) {
        this.props.onStartRecording()
      }

      this.setState({
        isRecordingDone: false,
        isRunningCountdown: true,
        isReplayingVideo: false
      })

      setTimeout(() => this.startRecording(), this.props.countdownTime)
    }
  }

  startRecording = () => {
    captureThumb(this.cameraVideo).then(thumbnail => {
      this.thumbnail = thumbnail

      this.recordedBlobs = []
      const options = {
        mimeType: this.getMimeType()
      }

      try {
        this.setState({
          isRunningCountdown: false,
          isRecording: true
        })
        this.startedAt = new Date().getTime()
        this.mediaRecorder = new window.MediaRecorder(this.stream, options)
        this.mediaRecorder.addEventListener('stop', this.handleStop)
        this.mediaRecorder.addEventListener('error', this.handleError)
        this.mediaRecorder.addEventListener(
          'dataavailable',
          this.handleDataAvailable
        )

        const { timeLimit, chunkSize, dataAvailableTimeout } = this.props
        this.mediaRecorder.start(chunkSize) // collect 10ms of data

        if (timeLimit) {
          this.timeLimitTimeout = setTimeout(() => {
            this.handleStopRecording()
          }, timeLimit)
        }

        // mediaRecorder.ondataavailable should be called every 10ms,
        // as that's what we're passing to mediaRecorder.start() above
        if (Number.isInteger(dataAvailableTimeout)) {
          setTimeout(() => {
            if (this.recordedBlobs.length === 0) {
              this.handleError(
                new ReactVideoRecorderDataAvailableTimeoutError(
                  dataAvailableTimeout
                )
              )
            }
          }, dataAvailableTimeout)
        }
      } catch (err) {
        console.error("Couldn't create MediaRecorder", err, options)
        this.handleError(err)
      }
    })
  }

  handleStop = event => {
    const endedAt = new Date().getTime()

    if (!this.recordedBlobs || this.recordedBlobs.length <= 0) {
      const error = new ReactVideoRecorderRecordedBlobsUnavailableError(event)
      console.error(error.message, event)
      this.handleError(error)
      return
    }

    clearTimeout(this.timeLimitTimeout)

    const videoBlob =
      this.recordedBlobs.length === 1
        ? this.recordedBlobs[0]
        : new window.Blob(this.recordedBlobs, {
          type: this.getMimeType()
        })

    const thumbnailBlob = this.thumbnail
    const startedAt = this.startedAt
    const duration = endedAt - startedAt

    // if this gets executed too soon, the last chunk of data is lost on FF
    this.mediaRecorder.ondataavailable = null

    this.setState({
      isRecordingDone: true,
      isRecording: false,
      isReplayingVideo: true,
      isReplayVideoMuted: true,
      videoBlob,
      videoUrl: window.URL.createObjectURL(videoBlob)
    })
    this.turnOffCamera()

    this.props.onRecordingComplete(
      videoBlob,
      startedAt,
      thumbnailBlob,
      duration,
      'webm'
    )
  }

  handleVideoSelected = e => {
    if (this.state.isReplayingVideo) {
      this.setState({
        isReplayingVideo: false
      })
    }

    const files = e.target.files || e.dataTransfer.files
    if (files.length === 0) return

    const startedAt = new Date().getTime()
    const video = files[0]

    e.target.value = null

    let extension = video.type

    let fileType = video.type ? video.type : undefined
    if (fileType && fileType.includes('/')) {
      fileType = fileType.split('/')
      extension = fileType[fileType.length - 1]
    }

    getVideoInfo(video)
      .then(({ duration, thumbnail }) => {
        this.setState({
          isRecording: false,
          isReplayingVideo: true,
          isReplayVideoMuted: true,
          videoBlob: video,
          videoUrl: window.URL.createObjectURL(video)
        })

        this.props.onRecordingComplete(
          video,
          startedAt,
          thumbnail,
          duration,
          extension
        )
      })
      .catch(err => {
        this.handleError(err)
      })
  }

  handleOpenVideoInput = () => {
    if (this.props.onOpenVideoInput) {
      this.props.onOpenVideoInput()
    }

    this.videoInput.current.value = null
    this.videoInput.current.click()
  }

  handleClearVideoInput = () => {
    this.setState({ isReplayingVideo: false })
    this.videoInput.current.value = null
  }

  handleStopReplaying = () => {
    this.setState({
      isRecordingDone: false
    })

    if (this.props.onStopReplaying) {
      this.props.onStopReplaying()
    }

    if (this.props.useVideoInput && this.props.isOnInitially) {
      return this.handleOpenVideoInput()
    }

    this.setState({
      isReplayingVideo: false
    })

    if (this.state.isInlineRecordingSupported && this.props.isOnInitially) {
      this.turnOnCamera()
    } else if (this.state.isVideoInputSupported && this.props.isOnInitially) {
      this.handleOpenVideoInput()
    }
  }

  handleReplayVideoClick = () => {
    if (this.replayVideo.paused && !this.props.showReplayControls) {
      this.replayVideo.play()
    }

    // fixes bug where seeking control during autoplay is not available until the video is almost completely played through
    if (!this.props.replayVideoAutoplayAndLoopOff) {
      this.setState({
        isReplayVideoMuted: !this.state.isReplayVideoMuted
      })
    }
  }

  // fixes bug where seeking control is not available until the video is almost completely played through
  handleDurationChange = () => {
    if (this.props.showReplayControls) {
      this.replayVideo.currentTime = 1000000
    }
  }

  renderCameraView () {
    const {
      locales,
      showReplayControls,
      replayVideoAutoplayAndLoopOff,
      renderDisconnectedView,
      renderVideoInputView,
      renderUnsupportedView,
      renderErrorView,
      renderLoadingView,
      useVideoInput
    } = this.props

    const {
      isVideoInputSupported,
      isReplayingVideo,
      isInlineRecordingSupported,
      thereWasAnError,
      isCameraOn,
      isConnecting,
      isReplayVideoMuted
    } = this.state

    const shouldUseVideoInput =
      useVideoInput || (!isInlineRecordingSupported && isVideoInputSupported)

    const videoInput = shouldUseVideoInput ? (
      <input
        ref={this.videoInput}
        key='videoInput'
        type='file'
        accept='video/*'
        capture={useVideoInput ? undefined : 'user'}
        style={{ display: 'none' }}
        onChange={this.handleVideoSelected}
      />
    ) : null

    if (isReplayingVideo) {
      return (
        <div className='camera-view' key='replay'>
          <video
            ref={el => (this.replayVideo = el)}
            className='video'
            src={
              this.props.videoUrl ? this.props.videoUrl : this.state.videoUrl
            }
            loop
            muted={isReplayVideoMuted}
            playsInline
            autoPlay={!replayVideoAutoplayAndLoopOff}
            controls={showReplayControls}
            onClick={this.handleReplayVideoClick}
            onDurationChange={this.handleDurationChange}
            disablePictureInPicture
            controlsList='nodownload'
          />
          {videoInput}
        </div>
      )
    }

    if (shouldUseVideoInput) {
      return renderVideoInputView({ videoInput })
    }

    if (!isInlineRecordingSupported) {
      return renderUnsupportedView({
        locales,
        onClick: this.handleVideoPlayerClose
      })
    }

    if (thereWasAnError) {
      return renderErrorView({ locales, onClick: this.handleVideoPlayerClose })
    }

    if (isCameraOn) {
      return (
        <div className='camera-view' key='camera'>
          <video
            className={this.props.isFlipped ? 'video flipped' : 'video'}
            ref={el => (this.cameraVideo = el)}
            autoPlay
            muted
            disablePictureInPicture
            controlsList='nodownload'
          />
        </div>
      )
    }

    if (isConnecting) {
      return renderLoadingView({ locales })
    }

    return renderDisconnectedView()
  }

  handleVideoPlayerClose = () => {
    if (this.props.onVideoPlayerClose) {
      this.props.onVideoPlayerClose()
    }
    this.turnOffCamera()
  }

  handleVideoPlayerDone = () => {
    if (this.props.onVideoPlayerDone) {
      this.props.onVideoPlayerDone()
    }
  }

  blobConverter = capturedData => {
    const BASE64_MARKER = ';base64,'
    const parts = capturedData.split(BASE64_MARKER)
    const contentType = parts[0].split(':')[1]
    const raw = window.atob(parts[1])
    const rawLength = raw.length
    const uInt8Array = new Uint8Array(rawLength)
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }
    /* eslint-disable no-undef */
    return new Blob([uInt8Array], { type: contentType })
  }

  handleScreenshot = () => {
    const { state, props } = this
    const { takePicture } = props
    if (!state.streamIsReady && this.props.onGetScreenshot) {
      this.props.onGetScreenshot(null)
    }
    const canvas = this.getCanvas()
    const capturedData =
      canvas &&
      canvas.toDataURL(
        takePicture.screenshotFormat,
        takePicture.screenshotQuality
      )
    this.setState({
      capturedData
    })
    const blob = this.blobConverter(capturedData)
    if (this.props.onGetScreenshot) {
      this.setState({
        isPictureCapture: true
      })
      this.props.onGetScreenshot({ blob, capturedData })
    }
  }

  getCanvas = () => {
    const { state, props } = this
    const { takePicture } = props

    if (!this.cameraVideo) {
      return null
    }

    if (!state.streamIsReady || !this.cameraVideo.videoHeight) return null

    if (!this.ctx) {
      let canvasWidth = this.cameraVideo.videoWidth
      let canvasHeight = this.cameraVideo.videoHeight
      if (!takePicture.forceScreenshotSourceSize) {
        const aspectRatio = canvasWidth / canvasHeight

        canvasWidth =
          takePicture.minScreenshotWidth || this.cameraVideo.clientWidth
        canvasHeight = canvasWidth / aspectRatio

        if (
          takePicture.minScreenshotHeight &&
          canvasHeight < takePicture.minScreenshotHeight
        ) {
          canvasHeight = takePicture.minScreenshotHeight
          canvasWidth = canvasHeight * aspectRatio
        }
      }

      this.canvas = document.createElement('canvas')
      this.canvas.width = takePicture.width || canvasWidth
      this.canvas.height = takePicture.height || canvasHeight
      this.ctx = this.canvas.getContext('2d')
    }

    const { ctx, canvas } = this

    if (ctx && canvas) {
      // mirror the screenshot
      if (takePicture.mirrored) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }

      ctx.imageSmoothingEnabled = takePicture.imageSmoothing
      ctx.drawImage(this.cameraVideo, 0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        this.cameraVideo,
        0,
        0,
        takePicture.width || canvas.width,
        takePicture.height || canvas.height
      )

      // invert mirroring
      if (takePicture.mirrored) {
        ctx.scale(-1, 1)
        ctx.translate(-canvas.width, 0)
      }
    }

    return canvas
  }

  imagePreview = () => {
    return (
      <div className='d-flex justify-content-center'>
        <img src={this.state.capturedData} alt='images' />
      </div>
    )
  }

  render () {
    const {
      isRecordingDone,
      isVideoInputSupported,
      isInlineRecordingSupported,
      thereWasAnError,
      isRecording,
      isCameraOn,
      streamIsReady,
      isConnecting,
      isRunningCountdown,
      isReplayingVideo,
      isReplayVideoMuted,
      isScreenCapture,
      isPictureCapture
    } = this.state
    const {
      takePicture,
      isFullScreen,
      locales,
      countdownTime,
      timeLimit,
      showReplayControls,
      replayVideoAutoplayAndLoopOff,
      renderActions,
      useVideoInput
    } = this.props
    const showAction = isCameraOn && !useVideoInput && isFullScreen
    const showVideoRecord =
      (showAction || isRecordingDone) && !isScreenCapture && isFullScreen
    const isRecordingDoneButton = isRecordingDone && isFullScreen
    return (
      <div className={`video-wrapper ${isFullScreen ? 'full-screen' : ''}`}>
        {isScreenCapture && (
          <VideoCaptureAction
            isRecording={isPictureCapture}
            isScreenCapture
            onVideoPlayerClose={this.handleVideoPlayerClose}
            onVideoPlayerDone={this.handleVideoPlayerDone}
          />
        )}

        {showVideoRecord && (
          <VideoCaptureAction
            isRecording={isRecordingDoneButton}
            isScreenCapture={false}
            onVideoPlayerClose={this.handleVideoPlayerClose}
            onVideoPlayerDone={this.handleVideoPlayerDone}
          />
        )}

        {isPictureCapture ? this.imagePreview() : this.renderCameraView()}
        {!isPictureCapture
          ? renderActions({
            isRecordingDoneButton,
            takePicture,
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
            isReplayVideoMuted,
            countdownTime,
            timeLimit,
            showReplayControls,
            replayVideoAutoplayAndLoopOff,
            useVideoInput,

            onTurnOnCamera: this.turnOnCamera,
            onTurnOffCamera: this.turnOffCamera,
            onOpenVideoInput: this.handleOpenVideoInput,
            onStartRecording: this.handleStartRecording,
            onStopRecording: this.handleStopRecording,
            onPauseRecording: this.handlePauseRecording,
            onResumeRecording: this.handleResumeRecording,
            onStopReplaying: this.handleStopReplaying
          })
          : null}
      </div>
    )
  }
}
