import './index.css';
import { jsPDF } from "jspdf";
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Upload from './Upload';

function Home() {
  const navigate = useNavigate();

  // State to store uploaded CSV data
  const [csvData, setCsvData] = useState(null);
  // State to store the generated demand letter
  const [demandLetter, setDemandLetter] = useState("Your demand letter will appear here...");

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  // Handle successful file upload
  const handleUploadSuccess = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      setCsvData(data); // ✅ Extract the first item from the array
      console.log("CSV Data Uploaded:", data);
    } else {
      console.error("Invalid upload response:", data);
      alert("Upload failed. Please try again.");
    }
  };



  // Handle demand letter generation
  const [loading, setLoading] = useState(false); // Add loading state

  const handleGenerateLetter = async () => {
    if (!csvData || csvData.length === 0) {
      alert("Please upload a CSV file first.");
      return;
    }

    setLoading(true); // Show loading message

    try {
      console.log("Sending CSV Data:", csvData);

      const response = await fetch("http://69.62.111.137:8000/api/v1/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: csvData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate demand letter.");
      }

      const result = await response.json();
      console.log("Received Demand Letter:", result);

      if (Array.isArray(result.demand_letter)) {
        setDemandLetter(result.demand_letter.join("\n\n"));
      } else {
        setDemandLetter(result.demand_letter);
      }
    } catch (error) {
      console.error("Error generating demand letter:", error);
      alert("Error generating demand letter. Please try again.");
    } finally {
      setLoading(false); // Hide loading message after response
    }
  };


  // Handle PDF download
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(demandLetter, 10, 10);
    doc.save("Generated_Letter.pdf");
  };

  return (
    <>
      <div className='App'>
        <aside className='side-menu'>
          <div className='dashboard'>
            <div className='dash-form'>
              <div className='dash-title'>
                <h2>Create your Demand Letter</h2>
                <h4>Upload Your File Here</h4>
              </div>
              <div className='upload-file'>
                <Upload onUploadSuccess={handleUploadSuccess} /> {/* ✅ Pass function */}
              </div>
              {/* <div className='dash-submit'>
                <button onClick={handleGenerateLetter} disabled={loading}>
                  {loading ? "Generating..." : "Generate Demand Letter"}
                </button>
              </div> */}
            </div>
          </div>
        </aside>

        
      </div>
    </>
  );
}

export default Home;