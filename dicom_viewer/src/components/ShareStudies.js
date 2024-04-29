import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ShareStudies.css";

function ShareStudies() {
  const [sharedStudies, setSharedStudies] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null); // New state variable for patient ID
  const u = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `http://localhost/DicomFinalApi/api/DicomF/GetRecentSharedStudies?doctorId=${u.U_id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setSharedStudies(data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setError(error.message);
      });
  }, []);

  const handleStudyClick = (studyId) => {
    const selectedStudy1 = sharedStudies.find(
      (study) => study.S_id === studyId
    );
    if (selectedStudy1) {
      setSelectedPatientId(selectedStudy1.PatientInfo.U_id);
      navigate(`/studyview`, {
        state: { selectedStudy1 },
      }); // Pass selectedStudy in state
      console.log(selectedStudy1.PatientInfo.U_id);
    } else {
      alert("Study not found.");
    }
  };

  return (
    <div className="sharestudy-screen">
      <div className="sharestudies">
        <h2>Shared Studies</h2>
        {error && <p>Error: {error}</p>}
        <ul>
          {sharedStudies.map((study) => (
            <li key={study.S_id} onClick={() => handleStudyClick(study.S_id)}>
              {study.PatientInfo && (
                <>
                  <p>
                    {study.PatientInfo.Fname} {study.PatientInfo.Lname}
                  </p>
                </>
              )}
              <h3>{study.Title}</h3>
              <p>{study.FolderName}</p>
              <p>{study.ReportDate}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ShareStudies;
