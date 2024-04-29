import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import UserLoginScreen from "./components/UserLoginScreen";
import DoctorSignupScreen from "./components/DoctorSignupScreen";
import PatientDashboardScreen from "./components/PatientDashboardScreen";
import DoctorDashboardScreen from "./components/DoctorDashboardScreen";
import PatientSignupScreen from "./components/PatientSignupScreen";
import StudyView from "./components/StudyView";
import ImportStudy from "./components/ImportStudy";
import UserSignup from "./components/UserSignup";
import ListofStudies from "./components/ListofStudies";
import ViewStudySlices from "./components/ViewStudySlices";
import StudyFolders from "./components/StudyFolders";
import AllDoctors from "./components/AllDoctors";
import AllPatients from "./components/AllPatients";
import SearchResult from "./components/SearchResult";
import ShareStudies from "./components/ShareStudies";
import SlideShow from "./components/SlideShow";
import AnnotationsList from "./components/AnnotationsList";
import AnnotationSliceImages from "./components/AnnotationSliceImages";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserLoginScreen />} />

          <Route path="/usersignupscreen" element={<UserSignup />} />

          <Route path="/doctorsignupscreen" element={<DoctorSignupScreen />} />

          <Route
            path="/patientsignupscreen"
            element={<PatientSignupScreen />}
          />

          <Route
            path="/patientdashboard"
            element={<PatientDashboardScreen />}
          />

          <Route path="/importstudy" element={<ImportStudy />} />

          <Route path="/listofstudies" element={<ListofStudies />} />

          <Route path="/studyview" element={<StudyView />} />

          <Route path="/viewstudyslices" element={<ViewStudySlices />} />

          <Route path="/studyfolders" element={<StudyFolders />} />

          <Route path="/alldoctors" element={<AllDoctors />} />

          <Route path="/allpatients" element={<AllPatients />} />

          <Route path="/searchresults" element={<SearchResult />} />

          <Route path="/sharestudies" element={<ShareStudies />} />

          <Route path="/slideshow" element={<SlideShow />} />

          <Route path="/annotationslist" element={<AnnotationsList />} />

          <Route
            path="/annotationsliceimages"
            element={<AnnotationSliceImages />}
          />

          <Route path="/doctordashboard" element={<DoctorDashboardScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
