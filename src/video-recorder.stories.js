import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, text, number } from '@storybook/addon-knobs'

import VideoRecorder from './video-recorder'
// snap a pic
const locales = {
  recordFailLabel:
    'ओह तस्वीर! आपका ब्राउज़र आपके वीडियो को रिकॉर्ड करने में विफल रहा.',
  tryRecordingAgainLabel: 'कृपया इसे पुनः आरंभ करें और पुनः प्रयास करें 👍',
  loadingLabel: 'लोड हो रहा है...',
  pressLabel: 'दबाएँ',
  recLabel: 'आरईसी',
  whenReadyLabel: 'जब रेडी हो',
  retryLabel: 'पुन: प्रयास करें',
  addFileLabel: 'फाइल जोडें',
  capture: 'तस्वीर खींचो',
  recordButton: 'विडियो रेकार्ड करो',
  browserUncapableLabel: 'यह ब्राउज़र वीडियो रिकॉर्ड करने में असमर्थ है'
}

const handleRecordingComplete = (
  videoBlob,
  startedAt,
  thumbnailBlob,
  duration
) => {
  const urlCreator = window.URL || window.webkitURL
  const thumbUrl = thumbnailBlob && urlCreator.createObjectURL(thumbnailBlob)
  const videoUrl = urlCreator.createObjectURL(videoBlob)

  console.log('Video Blob', videoBlob.size, videoBlob, videoUrl)
  console.log('Thumb Blob', thumbnailBlob, thumbUrl)
  console.log('Started:', startedAt)
  console.log('Duration:', duration)

  return action('onRecordingComplete')(
    videoBlob,
    startedAt,
    thumbnailBlob,
    duration
  )
}

const actionLoggers = {
  onTurnOnCamera: action('onTurnOnCamera'),
  onTurnOffCamera: action('onTurnOffCamera'),
  onStartRecording: action('onStartRecording'),
  onStopRecording: action('onStopRecording'),
  onRecordingComplete: handleRecordingComplete,
  onOpenVideoInput: action('onOpenVideoInput'),
  onStopReplaying: action('onStopReplaying'),
  onGetScreenshot: action('onGetScreenshot'),
  onVideoPlayerClose: action('onVideoPlayerClose'),
  onVideoPlayerDone: action('onVideoPlayerDone')
}

const stories = storiesOf('VideoRecorder', module)
stories.addDecorator(withKnobs)

stories.addParameters({
  info: {
    components: {
      VideoRecorder
    },
    styles: {
      children: {
        height: '100%'
      }
    }
  }
})

stories.add('with default config', () => (
  <VideoRecorder
    takePicture={{
      clickPicture: true,
      screenshotFormat: 'image/jpeg',
      screenshotQuality: 0.92,
      forceScreenshotSourceSize: false,
      mirrored: false,
      imageSmoothing: true,
      width: 400,
      height: 300
    }}
    showCloseButton
    isFullScreen={false}
    locales={locales}
    mimeType={text('mimeType')}
    countdownTime={number('countdownTime', 3 * 1000)}
    timeLimit={number('timeLimit')}
    {...actionLoggers}
  />
))

stories.add('with isOnInitially=true', () => (
  <VideoRecorder
    isOnInitially
    locales={locales}
    mimeType={text('mimeType')}
    countdownTime={number('countdownTime', 3 * 1000)}
    timeLimit={number('timeLimit')}
    {...actionLoggers}
  />
))

stories.add('with useVideoInput=true isOnInitially=true', () => (
  <VideoRecorder isOnInitially useVideoInput {...actionLoggers} />
))

stories.add('without dataAvailableTimeout', () => (
  <VideoRecorder isOnInitially dataAvailableTimeout={null} {...actionLoggers} />
))

stories.add('with showReplayControls=true', () => (
  <VideoRecorder isOnInitially showReplayControls {...actionLoggers} />
))

stories.add(
  'with showReplayControls=true replayVideoAutoplayAndLoopOff=true',
  () => (
    <VideoRecorder
      locales={locales}
      isOnInitially
      showReplayControls
      replayVideoAutoplayAndLoopOff
      isReplayVideoInitiallyMuted={false}
      {...actionLoggers}
    />
  )
)

stories.add('with isFlipped=false', () => (
  <VideoRecorder isFlipped={false} showReplayControls {...actionLoggers} />
))
