import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import './App.css';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Form Data:", { name, email, password });

    // Ensure all fields are filled before submitting
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    };

    try {
      const response = await fetch("http://77.37.120.36:8000/api/v1/register", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      console.log("Registration successful", data);
      navigate("/"); // Redirect to login page
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-container">
        <h2 className="form-title">Register New User</h2>
        <form onSubmit={handleRegister} className="login-form">
          <InputField 
            type="text" 
            placeholder="Enter Your Name" 
            icon="" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <InputField 
            type="email" 
            placeholder="Enter Your Email" 
            icon="mail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <InputField 
            type="password" 
            placeholder="Enter Your Password" 
            icon="lock" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Register</button>
        </form>

        <p className="signup-prompt">
          Already have an account? <a href="/" className="signup-link">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
