import React from "react";
import PropTypes from "prop-types";

const UnsupportedView = (props) => (
  <div>
    {props.locales.browserUncapableLabel ||
      "This browser is uncapable of recording video"}
  </div>
);

// prop types
UnsupportedView.propTypes = {
  locales: PropTypes.object,
};

// default props
UnsupportedView.defaultProps = {
  locales: {},
};

export default UnsupportedView;
