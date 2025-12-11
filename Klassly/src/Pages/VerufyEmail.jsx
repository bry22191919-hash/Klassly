// src/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/verify/${token}`);
        const data = await res.json();
        if (res.ok) {
          setMessage("Email verified successfully! You can now log in.");
        } else {
          setMessage(data.error || "Verification failed.");
        }
      } catch (err) {
        setMessage("Server error. Please try again later.");
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{message}</h2>
      <Link to="/login">Go to Login</Link>
    </div>
  );
};

export default VerifyEmail;
