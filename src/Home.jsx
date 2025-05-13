import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import Upload from './Upload';
import './index.css';

function Home() {
  const navigate = useNavigate();

  const [csvData, setCsvData] = useState(null);
  const [demandLetter, setDemandLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleUploadSuccess = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      setCsvData(data);
      setStep(2);
    } else {
      alert("Upload failed. Please try again.");
    }
  };

  const handleGenerateLetter = async () => {
    if (!csvData) {
      alert("Please upload a CSV first.");
      return;
    }

    setLoading(true);
    setStep(2);

    try {
      const response = await fetch("http://69.62.111.137:8000/api/v1/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: csvData }),
      });

      const result = await response.json();
      const text = Array.isArray(result.demand_letter)
        ? result.demand_letter.join("\n\n")
        : result.demand_letter;

      setTimeout(() => {
        setDemandLetter(text);
        setLoading(false);
        setStep(3);
      }, 10000);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate demand letter.");
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(demandLetter, 10, 10);
    doc.save("Generated_Letter.pdf");
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Demand Letter Generator</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      {step === 1 && (
        <div className="section">
          <h2>Step 1: Upload CSV</h2>
          <Upload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {step === 2 && (
        <div className="section">
          <h2>Step 2: Generate Demand Letter</h2>
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Please wait while we generate your demand letter...</p>
            </div>
          ) : (
            <button className="button" onClick={handleGenerateLetter}>Generate Letter</button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="section">
          <h2>Step 3: Download</h2>
          <textarea
            className="output-box"
            value={demandLetter}
            rows={15}
            readOnly
          />
          <button className="button" onClick={handleDownloadPDF}>Download as PDF</button>
        </div>
      )}
    </div>
  );
}

export default Home;
