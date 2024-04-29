import React, { useState } from "react";

import "./ImportStudy.css";

function ImportStudy() {
  const [title, setTitle] = useState("");
  const [imagesArray, setImagesArray] = useState([]);
  const [error, setError] = useState(null);
  const [fileHierarchy, setFileHierarchy] = useState({});
  const [allFiles, setAllFiles] = useState([]);

  function buildFileHierarchy(files) {
    const hierarchy = {};
    // var folders = [];
    setAllFiles(files);
    // for (let file of files) {
    //   const path = file.webkitRelativePath.split("/");
    //   let currentLevel = hierarchy;

    //   // const isFound = folders.some((folder) => {
    //   //   if (folder.Name === path[1]) {
    //   //     var paths = folder.URL;
    //   //     paths = [...paths,file.webkitRelativePath];
    //   //     return true;
    //   //   }
    //   //   return false;
    //   // });

    //   // if (!isFound) {
    //   //   folders = [...folders, { Name: path[1], URL: file.webkitRelativePath }];
    //   //   console.log(path[1]);
    //   //   console.log(folders);
    //   // }

    //   // for (let i = 0; i < path.length; i++) {
    //   //   const part = path[i];

    //   //   if (!currentLevel[part]) {
    //   //     currentLevel[part] = i === path.length - 1 ? file : {};
    //   //   }

    //   //   currentLevel = currentLevel[part];
    //   // }
    // }

    return hierarchy;
  }

  function handleFolderSelect(e) {
    const files = e.target.files;
    if (files) {
      setFileHierarchy(buildFileHierarchy(Array.from(files)));
    }
  }

  // function renderFileHierarchy(hierarchy, depth = 0) {
  //   return (
  //     <ul>
  //       {Object.keys(hierarchy)
  //         .sort() // Sort the keys in ascending order
  //         .map((key) => (
  //           <li key={key} style={{ marginLeft: depth * 20 }}>
  //             {hierarchy[key] instanceof File ? key : key}
  //             {typeof hierarchy[key] === "object" &&
  //               renderFileHierarchy(hierarchy[key], depth + 1)}
  //           </li>
  //         ))}
  //     </ul>
  //   );
  // }

  // async function handleFolderSelect(e) {
  //   const files = e.target.files;
  //   if (files) {
  //     setImagesArray([...files]);
  //   }
  // }

  async function handleSubmit(e) {
    e.preventDefault();

    // if (!title || imagesArray.length === 0) {
    //   setError("Please fill out all fields.");
    //   return;
    // }

    var u = JSON.parse(localStorage.getItem("user"));

    const data = {
      Title: title,
      user_Id: u.U_id,
    };
    const response = await fetch(
      "http://localhost/DicomFinalApi/api/DicomF/NewStudy",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const studyInfo = await response.json();
      console.log("Upload successfully", studyInfo);
      UploadFiles(studyInfo);
    } else {
      console.error("Upload Failed:", response.statusText);
    }
  }

  async function UploadFiles(studyInfo) {
    for (let file of allFiles) {
      const path = file.webkitRelativePath.split("/");

      const formData = new FormData();
      formData.append("masterFolderName", studyInfo.FolderName);
      formData.append("subFolderName", path[1]);
      formData.append("study_id", studyInfo.S_id);
      formData.append("file", file, path[2]);

      try {
        const response = await fetch(
          "http://localhost/DicomFinalApi/api/DicomF/UploadSlices",
          {
            method: "POST",
            body: formData,
            // headers: {
            //   "Content-Type": "application/json",
            // },
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log("Upload successfully", responseData);
        } else {
          console.error("Upload Failed:", response.statusText);
        }
      } catch (error) {
        setError("Error occurred while uploading folder: ", error);
      }
    }
  }

  return (
    <div className="import-screen">
      <div className="patient__importScreen">
        <h1>Import Study</h1>
        <form>
          <label htmlFor="title">Study Label</label>
          <input
            type="text"
            id="title"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />

          <label htmlFor="directory">Choose Directory</label>
          <input
            type="file"
            id="directory"
            multiple
            directory=""
            webkitdirectory=""
            onChange={handleFolderSelect}
            required
          />

          {/* Display file hierarchy */}
          {/* <div className="file-hierarchy">
            {Object.keys(fileHierarchy).length > 0 &&
              renderFileHierarchy(fileHierarchy)}
          </div> */}

          <button onClick={handleSubmit} className="button">
            Upload
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default ImportStudy;
