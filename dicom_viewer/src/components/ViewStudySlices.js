import React, { useState, useEffect, useRef } from "react";
import "./ViewStudySlices.css";
import Slider from "@mui/material/Slider";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import MenuItem from "@mui/material/MenuItem";
import { LiaToggleOffSolid } from "react-icons/lia";
import { LiaToggleOnSolid } from "react-icons/lia";
import { AiOutlineAudio } from "react-icons/ai";
import { BsSlashLg } from "react-icons/bs";
import { PiTextT } from "react-icons/pi";
import styled from "styled-components";
import { Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { MdAnimation } from "react-icons/md";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import RecordRTC from "recordrtc";
import { Modal } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const ViewStudySlices = () => {
  const [data, setData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSliceIndex, setSelectedSliceIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAnnotationsOn, setIsAnnotationsOn] = useState(false);
  const [drawnCircles, setDrawnCircles] = useState([]);
  const [drawnLines, setDrawnLines] = useState([]);
  const [drawnText, setDrawnText] = useState([]);
  const [selectedTool, setSelectedTool] = useState(); // New state to track selected tool
  const [circles, setCircles] = useState([]);
  const [lines, setLines] = useState([]);
  const [text, setText] = useState("");
  const [isTextPopupOpen, setTextPopupOpen] = useState(false);
  const [clickedPoint, setClickedPoint] = useState({ x: 0, y: 0 });
  const [annotationsHistory, setAnnotationsHistory] = useState([]);

  const [slid, setslid] = useState(0);
  const [allShapes, setAllShapes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const navigate = useNavigate();

  const [startSliceIndex, setStartSliceIndex] = useState([0]);
  const [endSliceIndex, setEndSliceIndex] = useState([0]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [animationIconClicked, setAnimationIconClicked] = useState(false);

  const textareaRef = useRef(null);

  const handleAudioIconClick = () => {
    if (
      startSliceIndex === 0 ||
      endSliceIndex === 0 ||
      !textareaRef.current.value
    ) {
      alert(
        "Please select both start and end indices and add a description before recording audio."
      );
      return;
    }

    setIsRecording((prev) => !prev);

    if (!isRecording) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const options = {
            mimeType: "audio/mp3",
            recorderType: RecordRTC.StereoAudioRecorder,
            desiredSampRate: 16000, // Optional, sample rate in Hz
          };
          const recorder = RecordRTC(stream, options);
          setMediaRecorder(recorder); // Save recorder to state

          recorder.startRecording();
          setIsRecording(true);
        })
        .catch((err) => console.error(err));
    } else {
      if (mediaRecorder) {
        mediaRecorder.stopRecording(() => {
          let blob = mediaRecorder.getBlob();
          setAudioBlob(blob);
        });
        setIsRecording(false);
      } else {
        console.warn("Recorder not yet initialized");
      }
    }
  };

  const handlePlayAudio = () => {
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      const audioElement = document.createElement("audio");
      audioElement.src = audioURL;
      audioElement.play();
    } else {
      console.log("No audio recording available");
    }
  };

  const handleAnimationIconClick = () => {
    setAnimationIconClicked(!animationIconClicked);
  };

  const handleSubmit = async () => {
    // Check if necessary fields are filled
    if (
      startSliceIndex === 0 ||
      endSliceIndex === 0 ||
      !textareaRef.current.value ||
      !audioBlob
    ) {
      alert(
        "Please ensure all fields are filled and an audio recording is made before saving."
      );
      return;
    }

    const queryParams = new URLSearchParams(window.location.search);
    const studyId = queryParams.get("studyId");

    const formData = new FormData();
    formData.append("slices", `${startSliceIndex}${endSliceIndex}`); // Assuming your slices are the start and end indices
    formData.append("description", textareaRef.current.value);
    formData.append("studyId", studyId); // You need to have a studyId to send
    formData.append("audio", audioBlob, "audio.mp3");

    try {
      const response = await fetch(
        "http://localhost/DicomFinalApi/api/DicomF/SlideShow",
        {
          method: "POST",
          body: formData,
          // headers: {
          //   "Content-Type": "application/json",
          // },
        }
      );
      const result = await response.json();
      console.log("API Response:", result);
      if (response.ok) {
        alert("Data saved successfully");
        // Handle successful save here, maybe clear the form or redirect
      } else {
        throw new Error(result.message); // Assuming your API returns a JSON with a message field in case of error
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data");
    }
  };

  function saveAnnotations() {
    let u = JSON.parse(localStorage.getItem("user"));

    try {
      fetch(
        ` http://localhost/DicomFinalApi/api/DicomF/AddAnnotations?sliceId=${slid}&userId=${
          u.U_id
        }&userType=${encodeURIComponent(u.UType)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(allShapes),
        }
      );

      setAllShapes([]);
      setAnnotationsHistory([]);
      setRedoStack([]);
    } catch (error) {
      console.log("Network error: " + error.message);
    }
  }

  const clearAnnotationsAndRedoStack = () => {
    setDrawnText([]);
    setCircles([]);
    setLines([]);
    setAnnotationsHistory([{ circles: [], lines: [], text: [] }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (annotationsHistory.length > 0) {
      const previousState = annotationsHistory.pop();
      setRedoStack([...redoStack, { circles, lines, drawnText }]);

      setCircles(previousState.circles);
      setLines(previousState.lines);
      setDrawnText(previousState.text || []); // Ensure drawnText is an array
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setAnnotationsHistory([
        ...annotationsHistory,
        {
          circles: nextState.circles,
          lines: nextState.lines,
          drawnText: nextState.drawnText,
        },
      ]);

      setCircles(nextState.circles);
      setLines(nextState.lines);
      setDrawnText(nextState.drawnText || []);
    }
  };

  const addCircleOrLine = (event) => {
    if (selectedTool === "circle") {
      addCircle(event);
    } else if (selectedTool === "line") {
      addLine(event);
    } else if (selectedTool === "text") {
      // Don't add text immediately; handle in handleTextSave
      handleTextPopupOpen(event);
    }

    if (isTextPopupOpen) {
      handleTextPopupClose();
    }

    const currentState = {
      circles: [...circles],
      lines: [...lines],
      text: [...drawnText],
    };

    setAnnotationsHistory([...annotationsHistory, currentState]);
    setRedoStack([]);
  };

  const handleTextPopupOpen = (event) => {
    if (isAnnotationsOn && selectedTool === "text") {
      const [x, y] = getClickCoords(event);

      // Adjust coordinates based on image position
      const imageElement = document.querySelector(".selected-image img");
      const adjustedX = x + imageElement.offsetLeft;
      const adjustedY = y + imageElement.offsetTop;

      setClickedPoint({ x: adjustedX, y: adjustedY });
      setTextPopupOpen(true);
    }
  };

  const handleTextPopupClose = () => {
    setTextPopupOpen(false);
  };

  const handleTextSave = () => {
    // Save text to the state
    const textWidth = text.length * 14; // Adjust the factor based on your font size
    const textHeight = 28; // Adjust based on your font size

    // Ensure that text is added within the image boundaries
    const minX = Math.max(0, clickedPoint.x - textWidth / 2);
    const minY = Math.max(0, clickedPoint.y - textHeight / 2);

    // Adjust coordinates based on image position
    const imageElement = document.querySelector(".selected-image img");
    if (imageElement) {
      const maxX = imageElement.clientWidth - textWidth;
      const maxY = imageElement.clientHeight - textHeight;

      const newX = Math.min(maxX, minX);
      const newY = Math.min(maxY, minY);

      const newTextElement = (
        <text
          key={drawnText.length + 1}
          x={newX}
          y={newY + textHeight}
          fill="red"
          fontSize={18}
        >
          {text}
        </text>
      );

      if (isAnnotationsOn) {
        let shape = {
          type: "TEXT",
          Json: `{'x':${newX},'y':${
            newY + textHeight
          },'Description':'${text}'}`,
        };
        let newShapes = [...allShapes, shape];
        setAllShapes(newShapes);
        setDrawnText((prevDrawnText) => [...prevDrawnText, newTextElement]);
      }

      // Close the popup
      handleTextPopupClose();

      // Reset the text state
      setText("");
    }
  };

  const getClickCoords = (event) => {
    var e = event.target;
    var { left, top } = e.getBoundingClientRect();
    var x = event.clientX - left;
    var y = event.clientY - top;
    console.log("Click Coords:", x, y);
    return [x, y];
  };

  const addCircle = (event) => {
    let [x, y] = getClickCoords(event);

    const imageElement = document.querySelector(".selected-image img");
    if (!imageElement) {
      // Handle case where imageElement is not found
      return;
    }

    const radius = 23;
    const imageWidth = imageElement.clientWidth;
    const imageHeight = imageElement.clientHeight;

    // Ensure the circle stays within the image boundaries
    x = Math.max(radius, Math.min(x, imageWidth - radius));
    y = Math.max(radius, Math.min(y, imageHeight - radius));

    let newCircle = (
      <circle
        key={circles.length + 1}
        cx={x}
        cy={y}
        r={radius}
        fill="none"
        stroke="red"
        strokeWidth="3"
      />
    );

    if (isAnnotationsOn) {
      let shape = {
        type: "CIRCLE",
        Json: `{'x':${x},'y':${y},'radius':${radius}}`,
      };
      let newShapes = [...allShapes, shape];
      setAllShapes(newShapes);
      setCircles([...circles, newCircle]);
    }
  };

  const addLine = (event) => {
    let [x, y] = getClickCoords(event);

    const halfLineLength = 25; // Adjust the half length as needed
    const imageElement = document.querySelector(".selected-image img");
    if (!imageElement) {
      // Handle case where imageElement is not found
      return;
    }

    const imageWidth = imageElement.clientWidth;
    const imageHeight = imageElement.clientHeight;

    // calculate the start and end coordinates based on the half-length
    let x1 = x - halfLineLength;
    let y1 = y;
    let x2 = x + halfLineLength;
    let y2 = y;

    // Adjust to ensure the line stays within the image boundaries
    x = Math.max(halfLineLength, Math.min(x, imageWidth - halfLineLength));
    y = Math.max(0, Math.min(y, imageHeight));

    let newLine = (
      <line
        key={lines.length + 1}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="red"
        strokeWidth="2"
      />
    );

    if (isAnnotationsOn) {
      let shape = {
        type: "LINE",
        Json: `{'x1':${x1},'y1':${y1},'x2':${x2},'y2':${y2}}`,
      };
      let newShapes = [...allShapes, shape];
      setAllShapes(newShapes);
      setLines([...lines, newLine]);
    }
  };

  useEffect(() => {
    const handleSaveShortcut = (event) => {
      // Check if the Ctrl key (or Command key on Mac) is pressed along with the 'S' key
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        // Prevent the default browser behavior of opening the save dialog
        event.preventDefault();

        // Call your save function here
        saveAnnotations();
      }
    };

    // Add event listener for Ctrl+S shortcut
    document.addEventListener("keydown", handleSaveShortcut);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleSaveShortcut);
    };
  }, [saveAnnotations]); // Add saveAnnotations as a dependency to ensure the latest function reference

  const handleKeyDown = (event) => {
    // Check for Ctrl key (or Command key on Mac) along with Z or Y key
    if ((event.ctrlKey || event.metaKey) && event.key === "z") {
      // Ctrl + Z for Undo
      event.preventDefault();
      handleUndo();
    } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
      // Ctrl + Y for Redo
      event.preventDefault();
      handleRedo();
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        let newValue = selectedSliceIndex;
        if (event.key === "ArrowRight" && newValue < data.length - 1) {
          newValue++;
        } else if (event.key === "ArrowLeft" && newValue > 0) {
          newValue--;
        }

        handleSliderChange(null, newValue);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedSliceIndex, data.length]);

  useEffect(() => {
    // Add event listener for keydown
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const clearAnnotations = () => {
    setDrawnCircles([]);
    setDrawnLines([]);
    setDrawnText([]);
  };

  const handleToggleAnnotations = () => {
    setIsAnnotationsOn((prev) => !prev);
  };

  const fetchSlicesData = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const studyId = queryParams.get("studyId");
    return fetch(
      `http://localhost/DicomFinalApi/api/DicomF/viewSlices?studyId=${studyId}`
    )
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      });
  };

  useEffect(() => {
    if (!isAnnotationsOn) {
      clearAnnotations();
    }
  }, [isAnnotationsOn]);

  useEffect(() => {
    fetchSlicesData();
  }, []);

  const handleThumbnailClick = (imagePath, index) => {
    clearAnnotationsAndRedoStack();
    setSelectedImage(imagePath);
    setSelectedSliceIndex(index);

    if (animationIconClicked) {
      setStartSliceIndex(index + 1);
      setAnimationIconClicked(false); // Reset the flag
    } else {
      // This will run when a thumbnail is clicked without clicking the Animation icon first
      if (startSliceIndex !== 0 && endSliceIndex == 0) {
        setEndSliceIndex(index + 1);
      }
    }
  };

  const getSliceAnnotations = (slid) => {
    try {
      fetch(
        `http://localhost/DicomFinalApi/api/DicomF/SliceAnnotations?sliceId=${slid}`
      )
        .then((res) => res.json())
        .then((d) => {
          const _circles = d
            .filter((v) => v.Type === "CIRCLE")
            .map((c) => {
              const obj = JSON.parse("{" + c.JsonDetail + "}");
              return {
                x: obj.x,
                y: obj.y,
                radius: obj.radius,
              };
            });

          const allcircles = _circles.map((c, idx) => {
            return (
              <circle
                key={"c" + idx + 1}
                cx={c.x}
                cy={c.y}
                r={c.radius}
                fill="none"
                stroke="red" // Set the border color
                strokeWidth="3"
              />
            );
          });
          setCircles(allcircles);

          const _lines = d
            .filter((v) => v.Type === "LINE")
            .map((l) => {
              const obj = JSON.parse("{" + l.JsonDetail + "}");
              return {
                x1: obj.x1,
                y1: obj.y1,
                x2: obj.x2,
                y2: obj.y2,
              };
            });

          const alllines = _lines.map((l, idx) => {
            return (
              <line
                key={"l" + idx + 1}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                fill="none"
                stroke="red" // Set the border color
                strokeWidth="3"
              />
            );
          });
          setLines(alllines);

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

  const scrollRef = useRef(null);
  const bottomScrollBarRef = useRef(null);

  const handleSliderChange = (event, newValue) => {
    clearAnnotationsAndRedoStack();
    setSelectedSliceIndex(newValue);

    if (data[newValue]) {
      const sl_id = data[newValue].Sl_id;
      getSliceAnnotations(sl_id);
      setAllShapes([]);
      setSelectedImage(data[newValue].ImagePath);
      scrollToThumbnail(newValue);
      scrollBottomBar(newValue); // Add this lin
    }
  };

  const scrollBottomBar = (index) => {
    const bottomBarContainer = bottomScrollBarRef.current;
    if (bottomBarContainer) {
      // Assuming each slider step corresponds to a fixed width in the bottom bar
      const stepWidth = bottomBarContainer.scrollWidth / data.length;
      const scrollPosition = stepWidth * index;

      bottomBarContainer.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToThumbnail = (index) => {
    const thumbnailElement = document.getElementById(`thumbnail-${index}`);
    const scrollContainer = scrollRef.current; // Assuming this is your horizontal scroll container

    if (thumbnailElement && scrollContainer) {
      const thumbnailRect = thumbnailElement.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();

      // Calculate the scroll amount relative to the container
      // Adjust the calculation if the alignment of thumbnails is different
      const scrollToLeft =
        thumbnailRect.left -
        containerRect.left +
        scrollContainer.scrollLeft -
        containerRect.width / 2 +
        thumbnailRect.width / 2;

      // Scroll inside the container
      scrollContainer.scrollTo({
        left: scrollToLeft,
        behavior: "smooth",
      });

      updateActiveThumbnail(index);
    }
  };

  const updateActiveThumbnail = (activeIndex) => {
    data.forEach((_, index) => {
      const thumbnailElement = document.getElementById(`thumbnail-${index}`);
      if (thumbnailElement) {
        if (index === activeIndex) {
          thumbnailElement.classList.add("active");
        } else {
          thumbnailElement.classList.remove("active");
        }
      }
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (data.length > 0 && data[selectedSliceIndex]) {
      const defaultImage = data[selectedSliceIndex].ImagePath;
      setSelectedImage(defaultImage);
    }
  }, [data, selectedSliceIndex]);

  useEffect(() => {
    const thumbnailElement = document.getElementById(
      `thumbnail-${selectedSliceIndex}`
    );
    if (thumbnailElement) {
      const parentContainer = thumbnailElement.parentElement; // Adjust this if the direct parent is not the scroll container

      if (parentContainer) {
        const thumbnailRect = thumbnailElement.getBoundingClientRect();
        const parentRect = parentContainer.getBoundingClientRect();

        // Calculate the scroll amount relative to the container
        const scrollTo =
          thumbnailRect.top -
          parentRect.top +
          parentContainer.scrollTop -
          parentContainer.clientHeight / 2 +
          thumbnailRect.height / 2;

        // Scroll inside the container without affecting the main scrollbar
        parentContainer.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
      }
    }
  }, [selectedSliceIndex]);

  const handleSlideShow = () => {
    navigate("/slideshow");
  };

  return (
    <div className="viewslices-screen">
      <div className="patient__viewSlicesScreen">
        <h1>View Slices</h1>

        {/* Navbar */}
        <nav className="menu-bar">
          <Toolbar>
            <label htmlFor="annotation" className="label">
              Annotations
            </label>
            <IconButton onClick={handleToggleAnnotations}>
              {isAnnotationsOn ? <LiaToggleOnSolid /> : <LiaToggleOffSolid />}
            </IconButton>

            <IconButton
              onClick={() => {
                setSelectedTool("text");
                handleTextPopupClose();
              }}
            >
              <PiTextT />
            </IconButton>

            <IconButton
              onClick={() => {
                setSelectedTool("circle");
                handleTextPopupClose();
              }}
            >
              <CircleOutlinedIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                setSelectedTool("line");
                handleTextPopupClose();
              }}
            >
              <BsSlashLg />
            </IconButton>

            <IconButton
              onClick={() => {
                handleUndo();
                handleTextPopupClose();
              }}
            >
              <UndoIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                handleRedo();
                handleTextPopupClose();
              }}
            >
              <RedoIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                handleTextPopupClose();
                saveAnnotations();
              }}
            >
              <Save />
            </IconButton>

            <IconButton
              onClick={() => {
                handleTextPopupClose();
                handleAnimationIconClick();
              }}
            >
              <MdAnimation />
            </IconButton>

            <IconButton onClick={handleMenuOpen}>
              <SlideshowIcon />
            </IconButton>

            <Modal
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                outline: "none",
                marginTop: "60px",
              }}
            >
              <div className="menubar">
                <MenuItem>
                  <label htmlFor="aboutdisease" className="underline">
                    <u>About Disease</u>
                  </label>
                </MenuItem>

                <MenuItem>
                  <input
                    type="number"
                    placeholder="Start"
                    className="inputtext"
                    value={startSliceIndex !== null ? startSliceIndex : ""}
                    readOnly
                  />
                  <input
                    type="number"
                    placeholder="End"
                    className="inputtext"
                    value={endSliceIndex !== null ? endSliceIndex : ""}
                    readOnly
                  />
                </MenuItem>

                <MenuItem>
                  <label htmlFor="myTextarea" className="underline">
                    Title
                  </label>
                </MenuItem>

                <MenuItem>
                  <textarea
                    id="myTextarea"
                    placeholder="Audio Description"
                    className="audiodesc"
                    rows={5}
                    cols={30}
                    ref={textareaRef}
                  />
                </MenuItem>

                <MenuItem>
                  <label htmlFor="audio" className="menulabel">
                    Audio Recording
                  </label>
                  <IconButton onClick={handleAudioIconClick}>
                    {isRecording ? (
                      <PauseCircleOutlineOutlinedIcon />
                    ) : (
                      <AiOutlineAudio />
                    )}
                  </IconButton>
                </MenuItem>

                <MenuItem>
                  <label htmlFor="play" className="menulabel">
                    Play Button
                  </label>
                  <IconButton onClick={handlePlayAudio}>
                    <PlayCircleOutlinedIcon />
                  </IconButton>
                </MenuItem>

                <MenuItem>
                  <label htmlFor="save" className="menulabel">
                    Save
                  </label>
                  <IconButton onClick={handleSubmit}>
                    <Save />
                  </IconButton>
                </MenuItem>
              </div>
            </Modal>
            <IconButton onClick={handleSlideShow}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Toolbar>
        </nav>

        <div ref={scrollRef}>
          {selectedImage && (
            <div className="selected-image">
              <div className="image-index-label">
                {selectedSliceIndex + 1} / {data.length}
              </div>

              <img
                src={`http://localhost/DicomFinalApi/${selectedImage}`}
                alt="Selected"
                onClick={addCircleOrLine}
              />

              {isAnnotationsOn && (
                <ClickableSVG onClick={addCircleOrLine}>
                  {circles}
                  {lines}
                  {drawnText}
                </ClickableSVG>
              )}
            </div>
          )}
        </div>

        {/* Text popup */}
        {isTextPopupOpen && (
          <div className="text-popup">
            <h2>Enter Text</h2>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleTextSave();
                }
              }}
            />
            <button onClick={handleTextSave}>Ok</button>
          </div>
        )}

        <div className="slider-container">
          <Slider
            value={selectedSliceIndex}
            min={0}
            max={data.length - 1}
            step={1}
            onChange={handleSliderChange}
            aria-labelledby="slider-label"
            style={{
              color: "green", // Change color of the track
            }}
          />
        </div>

        <div className="thumbnails">
          <div className="thumbnail-row" ref={bottomScrollBarRef}>
            {data.map((dataObj, index) => (
              <div
                key={index}
                className="thumbnail-container"
                id={`thumbnail-${index}`}
                ref={bottomScrollBarRef}
              >
                <img
                  src={`http://localhost/DicomFinalApi/${dataObj.ImagePath}`}
                  alt={`Thumbnail ${index}`}
                  onClick={() => {
                    handleThumbnailClick(dataObj.ImagePath, index);
                    setslid(dataObj.Sl_id);
                    getSliceAnnotations(dataObj.Sl_id);
                    setSelectedSliceIndex(index);
                  }}
                  className={
                    selectedImage === dataObj.ImagePath ? "active" : ""
                  }
                />

                <div className="image__index">{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudySlices;

const ClickableSVG = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;
