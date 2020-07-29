import React from 'react'
import PropTypes from 'prop-types'

const RecordButton = props => (
  <div className='rect-wrapper'>
    {!props.takePicture ? (
      <div className='instructions'>
        <div> {props.locales.pressLabel || 'PRESS'}</div>
        <div className='highlight'> {props.locales.recLabel || 'REC'} </div>
        {props.locales.whenReadyLabel || 'WHEN READY'}
      </div>
    ) : (
      <div className='instructions'>
        {props.locales.capture || 'SNAP A PIC'}{' '}
        {props.locales.whenReadyLabel || 'WHEN READY'}
      </div>
    )}

    <div className='button-border'>
      <button className='record-button' onClick={props.onClick} />
    </div>
  </div>
)

// prop types
RecordButton.propTypes = {
  onClick: PropTypes.func,
  locales: PropTypes.object,
  takePicture: PropTypes.object
}

// default props
RecordButton.defaultProps = {
  onClick: () => {},
  locales: {},
  takePicture: null
}

export default RecordButton
