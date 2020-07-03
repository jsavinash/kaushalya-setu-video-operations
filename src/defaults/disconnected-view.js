import React from 'react'
import cameraDisconnectedIcon from '../svg/camera-disconnected.svg'

const DisconnectedView = () => (
  <div className='svg-wrapper'>
    <img
      src={cameraDisconnectedIcon}
      data-qa='turn-on-camera'
      alt='camera disconnected'
      style={{
        width: '210px',
        height: '150px'
      }}
    />
  </div>
)

export default DisconnectedView
