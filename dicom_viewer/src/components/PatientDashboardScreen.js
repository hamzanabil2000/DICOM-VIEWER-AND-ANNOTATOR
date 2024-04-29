import React from "react";
import "./PatientDashboardScreen.css";
import DICOMViewer from "../assets/medkit-removebg-preview.png";
import { Link } from "react-router-dom";

function PatientDashboardScreen() {
  return (
    <div className="dashboard-screen">
      <div className="patient__dashboardScreen">
        <h1>Patient Side</h1>
        <img src={DICOMViewer} alt="" />

        <Link to="/importstudy" className="link">
          <button className="button">Study Upload</button>
        </Link>

        <Link to="/studyview" className="link">
          <button className="button">Study View</button>
        </Link>
      </div>
    </div>
  );
}

export default PatientDashboardScreen;
