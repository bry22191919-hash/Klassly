import React, { useState } from "react";
import axios from 'axios';
import {Link} from "react-router-dom";

const SignUp = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.post('http://localhost:3001/api/register', {name, email, password, role});
        alert('Sign Up successful! Your ID: ' + res.data.user_id)   
        } catch (err) {
            alert("Signing up failed: " + (err.response?.data?.error || err.response?.data));
        }
    };
    
    return(
        <div className="signup-form">
            <p>Sign Up Page</p>

            <form onSubmit={handleSignup}>
                <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                
                <select onChange={(e) => setRole(e.target.value)}>
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
                
                <button type="submit">Sign Up</button>
                <Link to={"/login"} >Log In</Link>

            </form>
        </div>
    );
};

export default SignUp;