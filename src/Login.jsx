import { useState } from 'react';
import { useNavigate } from "react-router-dom"; 
import SocialLogin from "./SocialLogin";
import InputField from "./InputField";
import './App.css';

const Login = () => {
  const navigate = useNavigate(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', email);
      formData.append('password', password);
      formData.append('client_id', 'string'); 
      formData.append('client_secret', 'string'); 
      formData.append('scope', '');

      const response = await fetch('http://77.37.120.36:8000/api/v1/login', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.description || 'Authentication failed');
      }

      localStorage.setItem("accessToken", data.access_token);
      
      
      navigate('/home'); 

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-container">
        <h2 className="form-title">Login into DemandLetter</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <InputField 
            type="email" 
            placeholder="Email address" 
            icon="mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField 
            type="password" 
            placeholder="Password" 
            icon="lock" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <a href="#" className="forgot-password-link">Forgot password?</a>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <p className="signup-prompt">
          Don&apos;t have an account? <a href="/register" className="signup-link">Sign up</a>
        </p>
      </div>
    </div>
  )
}

export default Login;










// import SocialLogin from "./SocialLogin";
// import InputField from "./InputField";
// import './App.css'


// const Register = () => {
//   return (
//     <div className="auth-page">
//     <div className="login-container">
//       <h2 className="form-title">Log in with</h2>
//       <SocialLogin />

//       <p className="separator"><span>or</span></p>

//       <form action="#" className="login-form">
//         <InputField type="email" placeholder="Email address" icon="mail" />
//         <InputField type="password" placeholder="Password" icon="lock" />

//         <a href="#" className="forgot-password-link">Forgot password?</a>
//         <button type="submit" className="login-button">Log In</button>
//       </form>

//       <p className="signup-prompt">
//         Don&apos;t have an account? <a href="/register" className="signup-link">Sign up</a>
//       </p>
//     </div>
//     </div>
//   )
// }

// export default Register;
