import React, { useState, useEffect } from "react";
import "./AllPatients.css";
import { useNavigate } from "react-router-dom";

function AllPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const navigate = useNavigate();

  const fetchStudyData = (userId) => {
    return fetch(
      `http://localhost/DicomFinalApi/api/DicomF/GetUserStudy?userId=${userId}`
    ).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch studies");
      }
      return res.json();
    });
  };

  const handlePatientClick = (user) => {
    fetchStudyData(user.U_id)
      .then((studies) => {
        if (studies.length > 0) {
          // Corrected: Pass the studies data as a state object
          navigate(`/studyview`, { state: { studies, userRole: "doctor" } });
        } else {
          alert("No studies found for this patient.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error fetching studies for the patient.");
      });
  };

  useEffect(() => {
    // Fetch data from the API
    fetch(`http://localhost/DicomFinalApi/api/DicomF/AllPatient`)
      .then((response) => response.json())
      .then((data) => setPatients(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleGenderChange = (event) => {
    setGenderFilter(event.target.value);
  };

  const filteredPatient = patients.filter((patient) => {
    // Convert full name and DOB to lowercase for case-insensitive comparison
    const fullName =
      `${patient.Fname} ${patient.Lname} ${patient.DOB} ${patient.City}`.toLowerCase();

    // Check if the patient's name matches the search term
    const nameMatches = fullName.includes(searchTerm.toLowerCase());

    // Check if the patient's gender matches the gender filter (if any)
    // Ensure the gender value in patient data and in the filter have the same format
    const genderMatches = genderFilter ? patient.Gender === genderFilter : true;

    // Include the patient if both name and gender conditions are met
    return nameMatches && genderMatches;
  });

  return (
    <div className="allpatients-screen">
      <div className="allpatients">
        <h2>All Patients</h2>

        {/* Display error message if present */}
        <input
          type="text"
          placeholder="Search Patient"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select onChange={handleGenderChange} className="gender-filter">
          <option value="">All Genders</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          {/* Add other gender options if needed */}
        </select>
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatient.map((patient) => (
              <tr
                key={patient.U_id /* Assuming each patient has a unique id */}
                onClick={() => handlePatientClick(patient)}
              >
                <td>
                  {patient.Fname} {patient.Lname}
                </td>
                <td>{patient.Gender}</td>
                <td>{patient.DOB}</td>
                <td>{patient.City}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllPatients;
