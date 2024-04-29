import React, { useState } from "react";
import "./UserSignup.css";
import { useNavigate } from "react-router-dom";

function UserSignup() {
  const [selectedOption, setSelectedOption] = useState(null);

  const [Fname, setFname] = useState("");
  const [Lname, setLname] = useState("");
  const [Login_id, setLogin_id] = useState("");
  const [Password, setPassword] = useState("");
  const [City, setCity] = useState("");
  const [error, setError] = useState(null);

  const history = useNavigate();

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleNextClick = () => {
    if (!Fname || !Lname || !Login_id || !Password) {
      setError("Please fill out all fields.");
      return;
    }

    var json = {
      Fname: Fname,
      Lname: Lname,
      Login_id: Login_id,
      City: City,
      Type: selectedOption,
      Password: Password,
      PhoneNo: Login_id,
    };
    if (selectedOption === "patient") {
      history("/patientsignupscreen", {
        state: json,
      });
    } else if (selectedOption === "doctor") {
      history("/doctorsignupscreen", {
        state: json,
      });
    }
  };

  return (
    <div className="signup-screen">
      <div className="user__signupScreen">
        <h1>User SignUp</h1>
        <form>
          <input
            onChange={(e) => setFname(e.target.value)}
            required
            type="text"
            placeholder="First Name"
          />
          <input
            onChange={(e) => setLname(e.target.value)}
            required
            type="text"
            placeholder="Last Name"
          />
          <input
            onChange={(e) => setLogin_id(e.target.value)}
            required
            type="text"
            placeholder="Phone No"
          />

          <input
            onChange={(e) => setCity(e.target.value)}
            required
            type="text"
            placeholder="City"
          />
          {/* <input required type="text" placeholder="User Name" /> */}
          <input
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder="Password"
          />
          {/* <input required type="password" placeholder="Confirm Password" /> */}

          <p>Select your Role</p>
          <div className="radiobuttons__container">
            <label>
              <input
                type="radio"
                value="patient"
                checked={selectedOption === "patient"}
                onChange={handleOptionChange}
                required
              />
              Patient
            </label>
          </div>

          <div className="radiobuttons__container">
            <label>
              <input
                type="radio"
                value="doctor"
                checked={selectedOption === "doctor"}
                onChange={handleOptionChange}
                required
              />
              Doctor
            </label>
          </div>

          <button type="button" className="button" onClick={handleNextClick}>
            Next
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default UserSignup;
