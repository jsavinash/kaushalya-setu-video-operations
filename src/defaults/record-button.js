import React from 'react'

export default props => (
  <div className='rect-wrapper'>
    <div className='instructions'>
      <div>PRESS </div>
      <div className='highlight'> REC </div>
      WHEN READY
    </div>

    <div className='border'>
      <button className='record-button' />
    </div>
  </div>
)
