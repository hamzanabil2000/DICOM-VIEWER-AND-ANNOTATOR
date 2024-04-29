import React, { useState } from "react";
import "./PatientSignupScreen.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function PatientSignupScreen() {
  const [selectedOption, setSelectedOption] = useState(""); // State for selected gender option
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    //alert(e.target.value);
    //alert(selectedOption);
    if (e.target.value === "male") {
      //alert(e.target.value);
      setGender("M");
    } else {
      setGender("F");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate user input before making the API call
    if (!dob || !selectedOption) {
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
      DOB: dob,
      Gender: gender, // Use the selectedOption directly
      UType: "Patient",
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
      <div className="patient__signupScreen">
        <h1>Patient SignUp</h1>
        <form>
          <p>Select Date of Birth</p>
          <input
            type="date"
            placeholder="DOB"
            className="datepicker"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <p>Select your Gender</p>
          <div className="radiobuttons__container">
            <label>
              <input
                type="radio"
                value="male"
                checked={selectedOption === "male"}
                onChange={handleOptionChange}
              />
              Male
            </label>

            <label>
              <input
                type="radio"
                value="female"
                checked={selectedOption === "female"}
                onChange={handleOptionChange}
              />
              Female
            </label>
          </div>

          <button onClick={handleSignUp} className="button">
            Signup
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default PatientSignupScreen;
