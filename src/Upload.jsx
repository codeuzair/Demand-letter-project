import React, { useState } from "react";

const BASE_URL = "http://77.37.120.36:8000/api/v1";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [renderedFileId, setRenderedFileId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [key, setKey] = useState(Date.now());

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a CSV file before uploading.");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setFileId(null);
    setTemplateData(null);
    setRenderedFileId(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.status === "processing" && data.file_id) {
        setUploadStatus("Processing...");
        setFileId(data.file_id);
        alert("File uploaded successfully!");
        setUploadProgress(100);
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFetchData = async () => {
    if (!fileId) {
      alert("Please upload a file first.");
      return;
    }

    setIsFetching(true);

    try {
      const response = await fetch(`${BASE_URL}/status/${fileId}?page=1&page_size=25`);
      const result = await response.json();

      console.log("Fetched status response:", result);

      if (result && result.data && result.data.length > 0) {
        setTemplateData(result.data[0]);
        alert("Data fetched successfully!");
      } else {
        throw new Error("No valid data found in status response.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleExecuteData = async () => {
    if (!templateData) {
      alert("Please fetch data first.");
      return;
    }

    setIsRendering(true);
    setRenderedFileId(null);

    try {
      const response = await fetch(`${BASE_URL}/render_template/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      const result = await response.json();
      console.log("Render result:", result);

      if (result.file_id) {
        const newFileId = result.file_id;

        // Polling until the file is ready
        const pollInterval = 2000; // 2 seconds
        const maxRetries = 10;
        let attempts = 0;

        const pollRenderedFile = async () => {
          attempts++;
          const pollResponse = await fetch(`${BASE_URL}/get_rendered_template/${newFileId}`);
          if (pollResponse.ok) {
            setRenderedFileId(newFileId);
            alert("Demand letter rendered successfully!");
            setIsRendering(false);
          } else if (attempts < maxRetries) {
            setTimeout(pollRenderedFile, pollInterval);
          } else {
            setIsRendering(false);
            alert("Rendering timeout. Please try again.");
          }
        };

        pollRenderedFile();
      } else {
        throw new Error("Render template did not return file_id");
      }
    } catch (error) {
      console.error("Render error:", error);
      alert("Failed to render demand letter.");
      setIsRendering(false);
    }
  };

  const handleSubmit = async () => {
    if (!renderedFileId) {
      alert("Please execute data first.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/get_rendered_template/${renderedFileId}`);

      if (!response.ok) {
        throw new Error("Invalid download.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "demand_letter.docx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download demand letter. Please ensure the file is rendered.");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setKey(Date.now());
    setUploadStatus(null);
    setFileId(null);
    setTemplateData(null);
    setRenderedFileId(null);
  };

  return (
    <div className="chatbox-input">
      <input
        key={key}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
        id="fileUpload"
      />

      <label htmlFor="fileUpload" className="upload-label" style={{ cursor: "pointer", color: "black" }}>
        Click to upload
      </label>

      {selectedFile && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "black" }}>{selectedFile.name}</p>
          <div style={{ width: "100%", background: "#ddd", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                background: "#9509cf",
                height: "8px",
                transition: "width 0.5s ease-in-out",
              }}
            />
          </div>

          <button
            className="remove-btn"
            onClick={handleRemoveFile}
            style={{
              marginTop: "8px",
              cursor: "pointer",
              background: "#9509cf",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
            }}
          >
            Remove
          </button>

          <button
            onClick={handleUpload}
            style={{
              marginTop: "8px",
              marginLeft: "10px",
              cursor: "pointer",
              background: isUploading ? "#ccc" : "#28a745",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
            }}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {fileId && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={handleFetchData}
            style={{
              cursor: "pointer",
              background: "#007bff",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              marginRight: "10px",
            }}
          >
            Fetch Data
          </button>

          {templateData && (
            <button
              onClick={handleExecuteData}
              disabled={isRendering}
              style={{
                cursor: isRendering ? "not-allowed" : "pointer",
                background: "#ffc107",
                color: "#000",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            >
              {isRendering ? "Rendering..." : "Execute Data"}
            </button>
          )}

          {renderedFileId && (
            <button
              onClick={handleSubmit}
              style={{
                cursor: "pointer",
                background: "#28a745",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
              }}
            >
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;
