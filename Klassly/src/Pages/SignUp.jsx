import React, { useState } from "react";
import axios from 'axios';
import {Link, useNavigate} from "react-router-dom";

const SignUp = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const nav = useNavigate()

    const handleSignup = async (e) => {
        e.preventDefault();

        const passwordRules = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRules.test(password)) {
            setError("Password must be at least 8 characters, include one uppercase letter and one number.");
            return;
        }

        setError('');

        try{
            const res = await axios.post('http://localhost:3001/api/register', {
                name,
                email,
                password,
                role
            });

            alert('Sign Up successful! Your ID: ' + res.data.user_id);
            nav('/login');

        } catch (err) {
            alert("Signing up failed: " + (err.response?.data?.error || err.response?.data));
        }
        
    };
    
    return(
        <div className="signup-form">
            <p>Sign Up Page</p>

            <form onSubmit={handleSignup}>
                {error && <p style={{ color: "red" }}>{error}</p>}

                <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                
                <select onChange={(e) => setRole(e.target.value)}>
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
                
                <button type="submit">Sign Up</button>
                <Link to={"/login"}>Log In</Link>
            </form>
        </div>
    );
};

export default SignUp;
