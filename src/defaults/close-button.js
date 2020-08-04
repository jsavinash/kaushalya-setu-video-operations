import React from 'react'
import PropTypes from 'prop-types'
import closeIcon from '../svg/grey-close.svg'

const CloseButton = props => (
  <div className='top-cancel-button-wrapper' onClick={props.onClick}>
    <img
      src={closeIcon}
      data-qa='btn'
      className='top-cancel-btn'
      alt='cancel'
    />
  </div>
)

// prop types
CloseButton.propTypes = {
  onClick: PropTypes.func
}

// default props
CloseButton.defaultProps = {
  onClick: () => {}
}

export default CloseButton
