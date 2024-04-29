import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShareIcon from "@mui/icons-material/Share";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import "./StudyView.css";
import { Search } from "@mui/icons-material";
import { FiAlignJustify } from "react-icons/fi";

const StudyViewPage = () => {
  const [data, setData] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState();
  const history = useNavigate();
  const location = useLocation();
  const studies = location.state?.studies;
  const selectedStudy1 = location.state?.selectedStudy1;

  useEffect(() => {
    if (selectedStudy1) {
      setSelectedStudy(location.state?.selectedStudy1);
      //console.log(location.state.selectedStudy1);
    }
  }, [location.state?.selectedStudy1]);

  const fetchStudyData = () => {
    var u = JSON.parse(localStorage.getItem("user"));

    return fetch(
      `http://localhost/DicomFinalApi/api/DicomF/GetUserStudy?userId=${u.U_id}`
    )
      .then((res) => res.json())
      .then((d) => setData(d));
  };

  useEffect(() => {
    if (selectedStudy1) {
      setData([selectedStudy1]);
    } else if (studies && studies.length > 0) {
      setData(studies);
    } else {
      fetchStudyData();
    }
  }, [selectedStudy1, studies]);

  const handleSearch = () => {
    history("/searchresults");
  };

  return (
    <div className="studyview-screen">
      <div className="patient__studyviewScreen">
        <h1>View Studies</h1>

        <label style={{ fontWeight: "bold" }}>Search Annotations</label>
        <Search
          onClick={() => handleSearch()}
          style={{ fontSize: "25px", cursor: "pointer", display: "flex" }}
        ></Search>

        {data.map((dataObj) => (
          <div className="patient__studyData" key={dataObj.S_id}>
            <div className="study-info">
              <p>{dataObj.Title}</p>
              <p>{dataObj.ReportDate}</p>
            </div>

            <div className="study-icons">
              <button
                onClick={() => {
                  history(`/alldoctors?studyId=${dataObj.S_id}`);
                }}
              >
                <ShareIcon />
              </button>

              <button
                onClick={() => {
                  history(`/studyfolders?studyId=${dataObj.S_id}`, {
                    state: { studyId: dataObj.S_id },
                  });
                }}
              >
                <label
                  htmlFor="R"
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    marginBottom: "2px",
                    cursor: "pointer",
                  }}
                >
                  R
                </label>
              </button>

              <button
                onClick={() => {
                  history(`/viewstudyslices?studyId=${dataObj.S_id}`);
                }}
              >
                <NavigateNextIcon />
              </button>

              <button
                onClick={() => {
                  history(`/annotationslist?studyId=${dataObj.S_id}`);
                }}
              >
                <label
                  htmlFor="A"
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    marginBottom: "2px",
                    cursor: "pointer",
                  }}
                >
                  A
                </label>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyViewPage;
