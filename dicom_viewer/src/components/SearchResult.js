import React, { useState } from "react";
import styled from "styled-components";
import "./SearchResult.css";

function SearchResult() {
  const [searchText, setSearchText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [data, setData] = useState([]);
  const [drawnText, setDrawnText] = useState([]);
  const [slid, setslid] = useState(0);

  const handleThumbnailClick = (imagePath, imageSlid) => {
    setSelectedImage(imagePath);
    setslid(imageSlid);
  };

  const fetchData = async () => {
    try {
      var u = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `http://localhost/DicomFinalApi/api/DicomF/GetSlicesByDescription?userId=${u.U_id}&&searchText=${searchText}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setData(data);

      console.log(data);

      // Automatically select the first image if available
      if (data && data.length > 0) {
        setSelectedImage(data[0].ImagePath);
      }
    } catch (error) {
      console.error("Fetching data failed:", error);
    }
  };

  const getSliceAnnotations = (slid) => {
    try {
      fetch(
        `http://localhost/DicomFinalApi/api/DicomF/SliceAnnotations?sliceId=${slid}`
      )
        .then((res) => res.json())
        .then((d) => {
          const _texts = d
            .filter((v) => v.Type === "TEXT")
            .map((t) => {
              const obj = JSON.parse("{" + t.JsonDetail + "}");
              return {
                x: obj.x,
                y: obj.y,
                Description: obj.Description,
              };
            });

          const alltexts = _texts.map((t, idx) => {
            return (
              <text
                key={"t" + idx + 1}
                x={t.x}
                y={t.y}
                fill="red"
                fontSize={18}
              >
                {t.Description}
              </text>
            );
          });
          setDrawnText(alltexts);
        });
    } catch (error) {
      console.log("Network error: " + error.message);
    }
  };

  return (
    <div className="searchresult-screen">
      <div className="searchresults">
        <h1>Search Results</h1>
        <div className="search-field">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search annotations"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                fetchData();
              }
            }}
          />

          <button onClick={fetchData}>Search</button>
        </div>

        {/* Display the selected image */}
        {selectedImage && (
          <div className="selected-image">
            <img
              src={`http://localhost/DicomFinalApi/${selectedImage}`}
              alt="Selected Slice"
            />
            <ClickableSVG>{drawnText}</ClickableSVG>
          </div>
        )}

        {/* Thumbnails */}
        <div className="thumbnails">
          <div className="thumbnail-row1">
            {data.map((dataObj, index) => (
              <div
                key={index}
                className="thumbnail-container"
                id={`thumbnail-${index}`}
                onClick={() => {
                  handleThumbnailClick(dataObj.ImagePath, index);
                  setslid(dataObj.Sl_id);
                  getSliceAnnotations(dataObj.Sl_id);
                }}
              >
                <img
                  src={`http://localhost/DicomFinalApi/${dataObj.ImagePath}`}
                  alt={`Thumbnail ${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResult;

const ClickableSVG = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;
