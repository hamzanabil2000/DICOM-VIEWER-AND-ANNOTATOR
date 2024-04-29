import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import "./AnnotationSliceImages.css";

function AnnotationSliceImages() {
  const [sliceData, setSliceData] = useState({});
  const location = useLocation();
  const [circles, setCircles] = useState([]);
  const [lines, setLines] = useState([]);
  const [drawnText, setDrawnText] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const slId = searchParams.get("slId");

    const apiUrl = `http://localhost/DicomFinalApi/api/DicomF/GetSlices?slId=${slId}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setSliceData(data);
        getSliceAnnotations(data.Sl_id); // Pass the correct slId
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [location.search]);

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

          const allcircles = _circles.map((c, idx) => (
            <circle
              key={"c" + idx + 1}
              cx={c.x}
              cy={c.y}
              r={c.radius}
              fill="none"
              stroke="red"
              strokeWidth="3"
            />
          ));
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

          const alllines = _lines.map((l, idx) => (
            <line
              key={"l" + idx + 1}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              fill="none"
              stroke="red"
              strokeWidth="3"
            />
          ));
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

          const alltexts = _texts.map((t, idx) => (
            <text key={"t" + idx + 1} x={t.x} y={t.y} fill="red" fontSize={18}>
              {t.Description}
            </text>
          ));
          setDrawnText(alltexts);
        });
    } catch (error) {
      console.log("Network error: " + error.message);
    }
  };

  return (
    <div className="annotationsliceimages-screen">
      <div className="annotationsliceimages">
        <h2>Annotation Slice Images</h2>
        <div style={{ position: "relative", width: "400px", height: "400px" }}>
          <img
            src={`http://localhost/DicomFinalApi/${sliceData.ImagePath}`}
            alt=""
            style={{ width: "100%", height: "100%" }}
          />
          <ClickableSVG>
            {circles}
            {lines}
            {drawnText}
          </ClickableSVG>
        </div>
      </div>
    </div>
  );
}

export default AnnotationSliceImages;

const ClickableSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
