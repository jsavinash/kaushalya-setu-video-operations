import React from 'react'
import PropTypes from 'prop-types'

const RecordButton = props => (
  <div className='rect-wrapper'>
    <div className='instructions'>
      <div>PRESS </div>
      <div className='highlight'> REC </div>
      WHEN READY
    </div>

    <div className='button-border'>
      <button className='record-button' onClick={props.onClick} />
    </div>
  </div>
)

// prop types
RecordButton.propTypes = {
  onClick: PropTypes.func
}

// default props
RecordButton.defaultProps = {
  onClick: () => {}
}

export default RecordButton
