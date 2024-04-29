import React, { useState, useEffect } from "react";
import "./AnnotationsList.css";
import { useNavigate } from "react-router-dom";

function AnnotationsList() {
  const [annotations, setAnnotations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const studyId = queryParams.get("studyId");

    const apiUrl = `http://localhost/DicomFinalApi/api/DicomF/GetAnnotationsList?studyId=${studyId}`; // Replace with your actual API endpoint

    // Fetch data from the API
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Set the retrieved data to the state
        setAnnotations(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []); // Empty dependency array to run the effect only once on component mount

  const handleWhiteBoxClick = (slId) => {
    // Redirect to AnnotationsSliceImages with slId as a parameter
    navigate(`/AnnotationSliceImages?slId=${slId}`);
  };

  return (
    <div className="annotationslist-screen">
      <div className="annotationslist">
        <h2>Annotations List</h2>
        {annotations.map((annotation) => (
          <div
            className="Annotationsbox"
            key={annotation.Sl_id}
            onClick={() => handleWhiteBoxClick(annotation.Sl_id)}
          >
            <p>Annotation ID: {annotation.A_id}</p>

            <p>Slice ID: {annotation.Sl_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnnotationsList;
