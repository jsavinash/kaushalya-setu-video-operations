import React from "react";
import PropTypes from "prop-types";

const LoadingView = (props) => (
  <div className="loading-message">
    {props.locales.loadingLabel || "Loading..."}
  </div>
);

// prop types
LoadingView.propTypes = {
  locales: PropTypes.object,
};

// default props
LoadingView.defaultProps = {
  locales: {},
};

export default LoadingView;
