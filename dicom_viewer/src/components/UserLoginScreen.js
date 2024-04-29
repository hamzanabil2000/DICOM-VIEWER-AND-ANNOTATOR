import React, { useState } from "react";
import "./UserLoginScreen.css";
import DICOMViewer from "../assets/medkit-removebg-preview.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

function UserLoginScreen() {
  const history = useNavigate();
  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phonenumber || !password) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/DicomFinalApi/api/DicomF/login?userName=${phonenumber}&passwrd=${password}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        response.json().then((data) => {
          localStorage.setItem("user", JSON.stringify(data));
          if (data.UType === "Doctor") {
            history("/doctordashboard");
          } else if (data.UType === "Patient") {
            history("/patientdashboard");
          }
        });
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (error) {
      // Handle network errors or other exceptions here
      alert("Error during login:", error);
      alert("An error occurred while processing your request.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="login-screen">
      <div className="user__loginScreen">
        <h1>DICOM Viewer</h1>
        <img src={DICOMViewer} alt="" />

        <form>
          <PersonIcon
            style={{
              transform: "translateY(175%)",
              color: "green",
              marginRight: "280px",
            }}
          />

          <input
            type="text"
            placeholder="Enter Phone Number"
            value={phonenumber}
            onChange={(e) => setPhonenumber(e.target.value)}
          />

          <LockIcon
            style={{
              transform: "translateY(175%)",
              color: "green",
              marginRight: "280px",
            }}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <button onClick={handleLogin} className="button">
            Login
          </button>

          <Link to="/usersignupscreen" className="link">
            <button className="button">Signup</button>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default UserLoginScreen;
