import React, { useState, useEffect } from "react";
import "./StudyFolders.css";
import Slider from "@mui/material/Slider";
import { useLocation } from "react-router-dom";

function StudyFolders() {
  const [selectedbox, setSelectedBox] = useState(1);
  const [selectedFolder1, setSelectedFolder1] = useState(null);
  const [selectedFolder2, setSelectedFolder2] = useState(null);
  const [sliderValue1, setSliderValue1] = useState(0);
  const [sliderValue2, setSliderValue2] = useState(0);
  const [studyFolders, setStudyFolders] = useState([]);
  const [selectedFolderIndex, setSelectedFolderIndex] = useState(-1);
  const [refLineData, setRefLineData] = useState(null);
  const [studyId, setStudyId] = useState(null); // State to hold the current study ID
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const studyIdFromLocation = location.state?.studyId;
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);

  const drawReferenceLine = async (direction) => {
    if (selectedFolder1 && selectedFolder2) {
      var sourceId = selectedFolder1.Slices[sliderValue1].Sl_id;
      var destId = selectedFolder2.Slices[sliderValue2].Sl_id;

      if (direction === 2) {
        destId = selectedFolder1.Slices[sliderValue1].Sl_id;
        sourceId = selectedFolder2.Slices[sliderValue2].Sl_id;
      }

      try {
        const response = await fetch(
          `http://localhost/DicomFinalApi/api/DicomF/GetReferencePoint?sourceId=${sourceId}&destId=${destId}`
        );
        const points = await response.json();

        setRefLineData(points);
      } catch (err) {
        console.error("Error fetching reference line data:", err);
      }
    }
  };

  const drawLine = () => {
    if (refLineData == null) return;
    return (
      <svg
        height="500"
        width="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <line
          x1={refLineData.x1}
          y1={refLineData.y1}
          x2={refLineData.x2}
          y2={refLineData.y2}
          style={{ stroke: "red", strokeWidth: 2 }}
        />
      </svg>
    );
  };

  const fetchStudyFolders = (studyId) => {
    if (!studyId) return; // Do nothing if studyId is not set

    setIsLoading(true);
    fetch(
      `http://localhost/DicomFinalApi/api/DicomF/GetStudyFolders?studyId=${studyId}`
    )
      .then((res) => res.json())
      .then((d) => {
        setSelectedFolder1(d[0]);
        setSelectedFolder2(d[0]);
        setStudyFolders(d);
      })
      .catch((err) => {
        console.error("Error fetching study folders:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchStudyFolders(studyId);
  }, [studyId]);

  useEffect(() => {
    if (selectedFolder1 && selectedFolder2) {
      setCurrentIndex1(1);
      setCurrentIndex2(1);
      // Set the initial slider values to 0
      setSliderValue1(0);
      setSliderValue2(0);
    }
  }, [selectedFolder1, selectedFolder2]);

  useEffect(() => {
    if (studyIdFromLocation) {
      setStudyId(studyIdFromLocation);
    }
  }, [studyIdFromLocation]);

  const handleSlider1Visibility = () => {
    return selectedbox === 1 ? "visible" : "hidden";
  };

  const handleSlider2Visibility = () => {
    return selectedbox === 2 ? "visible" : "hidden";
  };

  const handleSliderChange1 = (event, newValue) => {
    setSliderValue1(newValue);
    drawReferenceLine(1);
    setCurrentIndex1(newValue + 1);
  };

  const handleSliderChange2 = (event, newValue) => {
    setSliderValue2(newValue);
    drawReferenceLine(2);
    setCurrentIndex2(newValue + 1);
  };

  const handleThumbnailClick = (index) => {
    if (selectedbox === 1) {
      setSliderValue1(0);
      setSelectedFolder1(studyFolders[index]);
    } else if (selectedbox === 2) {
      setSliderValue2(0);
      setSelectedFolder2(studyFolders[index]);
    }
    setSelectedFolderIndex(index);
  };

  const handleContainerClick = (container) => {
    setSelectedBox(container);
    drawReferenceLine(container);
  };

  // ... existing code ...

  const handleKeyDown = (event) => {
    if (selectedbox === 1 && selectedFolder1) {
      if (
        event.key === "ArrowRight" &&
        sliderValue1 < selectedFolder1.Slices.length - 1
      ) {
        setSliderValue1((prevValue) => {
          drawReferenceLine(1, prevValue + 1); // Use the updated value
          setCurrentIndex1(prevValue + 2);
          return prevValue + 1;
        });
      } else if (event.key === "ArrowLeft" && sliderValue1 > 0) {
        setSliderValue1((prevValue) => {
          drawReferenceLine(1, prevValue - 1); // Use the updated value
          setCurrentIndex1(prevValue);
          return prevValue - 1;
        });
      }
    } else if (selectedbox === 2 && selectedFolder2) {
      if (
        event.key === "ArrowRight" &&
        sliderValue2 < selectedFolder2.Slices.length - 1
      ) {
        setSliderValue2((prevValue) => {
          drawReferenceLine(2, prevValue + 1); // Use the updated value
          setCurrentIndex2(prevValue + 2);
          return prevValue + 1;
        });
      } else if (event.key === "ArrowLeft" && sliderValue2 > 0) {
        setSliderValue2((prevValue) => {
          drawReferenceLine(2, prevValue - 1); // Use the updated value
          setCurrentIndex2(prevValue);
          return prevValue - 1;
        });
      }
    }
  };

  // Redraw the reference line whenever the slider values change
  useEffect(() => {
    if (selectedbox === 1 && selectedFolder1) {
      drawReferenceLine(1);
    } else if (selectedbox === 2 && selectedFolder2) {
      drawReferenceLine(2);
    }
  }, [sliderValue1, sliderValue2]);
  // ... existing code ...

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    sliderValue1,
    sliderValue2,
    selectedFolder1,
    selectedFolder2,
    selectedbox,
  ]);

  return (
    <div className="studyfolders-screen">
      <div className="studyfolders">
        <h1>Reference Line</h1>

        <div className="studyfolder__thumbnail">
          <div className="thumbnail-col">
            {studyFolders.map((folder, index) => (
              <div
                key={index}
                className="thumbnail-foldercontainer"
                onClick={() => handleThumbnailClick(index)}
                style={{
                  border:
                    selectedFolderIndex === index ? "2px solid green" : "none",
                }}
              >
                <img
                  src={`http://localhost/DicomFinalApi/${folder.Slices[0].ImagePath}`}
                  alt={`Thumbnail ${index}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="studyfolder__image">
          {selectedFolder1 ? (
            <>
              <div
                className="left__half"
                onClick={() => handleContainerClick(1)}
              >
                <div className="slider-container1">
                  <Slider
                    value={sliderValue1}
                    onChange={handleSliderChange1}
                    min={0}
                    max={
                      selectedFolder1 != null
                        ? selectedFolder1.Slices.length - 1
                        : 1
                    }
                    aria-label="Slider 1"
                    style={{
                      color: "green",
                      visibility: handleSlider1Visibility(),
                    }}
                  />
                  <div className="index-number">{`${currentIndex1}/${
                    selectedFolder1 ? selectedFolder1.Slices.length : 1
                  }`}</div>

                  <div
                    style={{
                      marginTop: "-544px",
                      marginLeft: "-135px",
                      width: "160.5%",
                      position: "relative",
                    }}
                  >
                    <img
                      src={`http://localhost/DicomFinalApi/${selectedFolder1.Slices[sliderValue1].ImagePath}`}
                      alt={`Slice ${sliderValue1}`}
                      style={{
                        width: "125%",
                        height: "500px",
                        border: "2px solid green",
                      }}
                    />
                    {selectedbox === 2 && drawLine()}
                  </div>
                </div>
              </div>

              <div
                className="right__half"
                onClick={() => handleContainerClick(2)}
              >
                <div className="slider-container2">
                  <Slider
                    value={sliderValue2}
                    onChange={handleSliderChange2}
                    min={0}
                    max={
                      selectedFolder2 != null
                        ? selectedFolder2.Slices.length - 1
                        : 1
                    }
                    aria-label="Slider 2"
                    style={{
                      color: "green",
                      visibility: handleSlider2Visibility(),
                    }}
                  />
                  <div className="index-number">{`${currentIndex2}/${
                    selectedFolder2 ? selectedFolder2.Slices.length : 1
                  }`}</div>
                  <div
                    style={{
                      marginTop: "-544px",
                      marginLeft: "-135px",
                      width: "160.5%",
                      position: "relative",
                    }}
                  >
                    <img
                      src={`http://localhost/DicomFinalApi/${selectedFolder2.Slices[sliderValue2].ImagePath}`}
                      alt={`Slice ${sliderValue2}`}
                      style={{
                        width: "125%",
                        height: "500px",
                        border: "2px solid green",
                      }}
                    />
                    {selectedbox === 1 && drawLine()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Render default orange containers
            <div className="default-orange-containers">
              <div className="left__half1">
                <div className="slider-container1">
                  <Slider
                    value={sliderValue1}
                    onChange={handleSliderChange1}
                    aria-label="Slider 1"
                    style={{
                      color: "green",
                    }}
                  />
                </div>
              </div>
              <div className="right__half1">
                <div className="slider-container2">
                  <Slider
                    value={sliderValue2}
                    onChange={handleSliderChange2}
                    aria-label="Slider 2"
                    style={{
                      color: "green",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyFolders;
