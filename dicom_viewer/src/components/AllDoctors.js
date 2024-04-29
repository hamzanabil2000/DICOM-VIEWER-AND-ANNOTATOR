import React, { useState, useEffect } from "react";
import "./AllDoctors.css";

function AllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    fetch(`http://localhost/DicomFinalApi/api/DicomF/AllDoctor`)
      .then((response) => response.json())
      .then((data) => setDoctors(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = async () => {
    const u = JSON.parse(localStorage.getItem("user"));
    const queryParams = new URLSearchParams(window.location.search);
    const studyId = queryParams.get("studyId");

    for (const id of selectedIds) {
      // Corrected loop
      const data = {
        UserFromId: u.U_id,
        StudyId: studyId,
        UserToId: id,
      };

      try {
        await fetch("http://localhost/DicomFinalApi/api/DicomF/SharedStudy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        setError("Network error: " + error.message); // Handle error
      }
    }
  };

  const handleSelection = (event, id) => {
    const checked = event.target.checked;
    let ids = [...selectedIds];
    const index = ids.indexOf(id);

    if (checked && index === -1) {
      ids.push(id);
    } else if (!checked && index !== -1) {
      ids.splice(index, 1);
    }

    setSelectedIds(ids);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const fullName =
      `${doctor.Fname} ${doctor.Lname} ${doctor.Specialization}  ${doctor.City}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="alldoctors-screen">
      <div className="alldoctors">
        <h2>All Doctors</h2>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {filteredDoctors.map((doctor) => (
          <div className="doctorslist" key={doctor.id}>
            <div className="doctor-box">
              <input
                type="checkbox"
                onChange={(event) => handleSelection(event, doctor.U_id)}
                className="checkbox"
              />
              <p>
                Name: Dr. {doctor.Fname} {doctor.Lname}
              </p>
            </div>
            <div className="doctor-box1">
              <p>Specialization: {doctor.Specialization}</p>
            </div>
            <div className="doctor-box2">
              <p>City: {doctor.City}</p>
            </div>
          </div>
        ))}
        <button onClick={handleSubmit} className="floating-button">
          Share
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default AllDoctors;
