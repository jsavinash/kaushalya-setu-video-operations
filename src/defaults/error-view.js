import React from "react";
import PropTypes from "prop-types";

const ErrorView = (props) => (
  <div>
    {props.locales.recordFailLabel ||
      "Oh snap! Your browser failed to record your video."}
    <br />
    <br />
    {props.locales.tryRecordingAgainLabel ||
      "Please restart it and try again"}{" "}
    👍
  </div>
);

// prop types
ErrorView.propTypes = {
  locales: PropTypes.object,
};

// default props
ErrorView.defaultProps = {
  locales: {},
};

export default ErrorView;
