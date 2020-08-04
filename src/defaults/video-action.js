import React from "react";
import PropTypes from "prop-types";
import closeIcon from "../svg/close.svg";
import correctIcon from "../svg/correct.svg";

const VideoCaptureAction = (props) => {
  const {
    isRecording,
    isScreenCapture,
    onVideoPlayerClose,
    onVideoPlayerDone,
  } = props;
  const onVideoRecorded = isRecording ? "btn-full" : "";
  const pictureCaptureClassName = isScreenCapture ? "btn-pic" : "";

  return (
    <>
      <div className={`cancel-button-wrapper ${onVideoRecorded}`}>
        <img
          src={closeIcon}
          data-qa="btn"
          className={`cancel-btn ${pictureCaptureClassName}`}
          alt="cancel"
          onClick={onVideoPlayerClose}
        />
      </div>
      {isRecording && (
        <div className={`save-button-wrapper ${onVideoRecorded}`}>
          <img
            src={correctIcon}
            className={`save-btn ${pictureCaptureClassName}`}
            data-qa="btn"
            alt="correct"
            onClick={onVideoPlayerDone}
          />
        </div>
      )}
    </>
  );
};

// prop types
VideoCaptureAction.propTypes = {
  isRecording: PropTypes.bool,
  isScreenCapture: PropTypes.bool,
  onVideoPlayerClose: PropTypes.func,
  onVideoPlayerDone: PropTypes.func,
};

// default props
VideoCaptureAction.defaultProps = {
  isRecording: false,
  isScreenCapture: false,
  onVideoPlayerClose: () => ({}),
  onVideoPlayerDone: () => ({}),
};

export default VideoCaptureAction;
