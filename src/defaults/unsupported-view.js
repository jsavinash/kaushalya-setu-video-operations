import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from './close-button'

const UnsupportedView = props => (
  <div>
    <CloseButton onClick={props.onClick} />
    {props.locales.browserUncapableLabel ||
      'This browser is uncapable of recording video'}
  </div>
)

// prop types
UnsupportedView.propTypes = {
  locales: PropTypes.object,
  onClick: PropTypes.func
}

// default props
UnsupportedView.defaultProps = {
  locales: {},
  onClick: () => ({})
}

export default UnsupportedView
