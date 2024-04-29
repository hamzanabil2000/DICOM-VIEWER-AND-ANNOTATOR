import React, { useState, useEffect } from "react";
import "./DoctorDashboardScreen.css";
import DICOMViewer from "../assets/medkit-removebg-preview.png";
import { Link } from "react-router-dom";

function DoctorDashboardScreen() {
  return (
    <div className="dashboard-screen">
      <div className="doctor__dashboardScreen">
        <h1>Doctor Side</h1>
        <img src={DICOMViewer} alt="" />

        <Link to="/importstudy" className="link">
          <button className="button">Study Upload</button>
        </Link>

        <Link to="/studyview" className="link">
          <button className="button">Study View</button>
        </Link>

        <Link to="/sharestudies" className="link">
          <button className="button">Shared Patients</button>
        </Link>

        <Link to="/allpatients" className="link">
          <button className="button">All Patients</button>
        </Link>
      </div>
    </div>
  );
}

export default DoctorDashboardScreen;
