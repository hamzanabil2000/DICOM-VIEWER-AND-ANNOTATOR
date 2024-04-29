import React from "react";
import "./Popup.css"; // Define your CSS styles for the popup here

const Popup = ({ study, onClose }) => {
  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Info</h2>
        <p>{study.Title}</p>
        <p>{study.ReportDate}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
