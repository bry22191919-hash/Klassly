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
                // Backend returns { message, user }
                const user = data.user || data;
                // Keep the original user object for other parts of the app
                localStorage.setItem('user', JSON.stringify(user));
                // Also set specific keys other components expect
                localStorage.setItem('userId', String(user.id || user.user_id || ''));
                localStorage.setItem('userName', user.name || user.username || '');
                localStorage.setItem('role', user.role || '');
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

                <Link to={"/signup"} className="linkSignUp">Sign Up</Link>
            </div>
        </div>
    );
};

export default Login;
