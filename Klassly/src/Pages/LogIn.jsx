import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/home');
            } else {
                setError(data.error || 'Invalid Email or Password');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div className="ngilo-user">
            <div className="user-login">
                <h2 className="center-block">Log In</h2>
                <form onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required    
                    />

                    <button className="user-btn" type="submit">Log In</button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <Link to={"/register"} className="linkSignUp">Sign Up</Link>
            </div>
        </div>
    );
};

export default Login;
