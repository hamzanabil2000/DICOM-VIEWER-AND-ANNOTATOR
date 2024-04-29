import React, { useState } from "react";
import "./DoctorSignupScreen.css";
import { useNavigate } from "react-router-dom";

import { useLocation } from "react-router-dom";

function DoctorSignupScreen() {
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const location = useLocation();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate user input before making the API call
    if (!email || !specialization) {
      setError("Please fill out all fields.");
      return;
    }

    const data = {
      Fname: location.state.Fname,
      Lname: location.state.Lname,
      Login_id: location.state.Login_id,
      Password: location.state.Password,
      City: location.state.City,
      PhoneNo: location.state.PhoneNo,
      Email: email,
      Specialization: specialization,
      UType: "Doctor",
    };

    try {
      const response = await fetch(
        "http://localhost/DicomFinalApi/api/DicomF/SignUp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        navigate("/");
      } else {
        setError("Error while signing up. Please try again later.");
      }
    } catch (error) {
      setError("Network error: " + error.message);
    }
  };

  return (
    <div className="signup-screen">
      <div className="doctor__signupScreen">
        <h1>Doctor SignUp</h1>
        <form>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Specialization"
            onChange={(e) => setSpecialization(e.target.value)}
          />

          <button className="button" onClick={handleSignUp}>
            Signup
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default DoctorSignupScreen;
