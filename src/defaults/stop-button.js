import React from 'react'
import PropTypes from 'prop-types'

const StopButton = props => (
  <div className='button-border'>
    <button className='stop-button' onClick={props.onClick} />
  </div>
)

// prop types
StopButton.propTypes = {
  onClick: PropTypes.func
}

// default props
StopButton.defaultProps = {
  onClick: () => {}
}

export default StopButton
