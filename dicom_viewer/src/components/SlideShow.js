import React, { useEffect, useState } from "react";
import "./SlideShow.css";

function SlideShow() {
  const [description, setDescription] = useState([]);

  useEffect(() => {
    fetch(
      `http://localhost/DicomFinalApi/api/DicomF/GetSlideShows?studyId=1015`
    )
      .then((response) => response.json())
      .then((data) => {
        setDescription(data);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="slideshow-screen">
      <div className="slideshow">
        <h1>Cases Description</h1>
        {description.map((slideshow) => {
          <div style={{ color: "black" }}>
            <p>{slideshow.Descriptions}</p>
            <p>{slideshow.SlideId}</p>
          </div>;
        })}
      </div>
    </div>
  );
}

export default SlideShow;
