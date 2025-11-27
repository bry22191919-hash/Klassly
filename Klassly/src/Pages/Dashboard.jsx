import { useEffect, useState } from "react";
import ClassCard from "../Components/ClassCards";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const navigate = useNavigate();
    const userId = Number(localStorage.getItem("userId"));
    const role = localStorage.getItem("role");
    
    useEffect(() => {
        const fetchClass = async () => {
            // First, try to get classes from localStorage (for newly created ones)
            const localClasses = JSON.parse(localStorage.getItem('classes')) || [];
            if (localClasses.length > 0) {
                setClasses(localClasses);
                return; // Stop here if we found local classes
            }

            // If no local classes, fetch from the API as before
            if (!userId) return;
            try {
                const res = await axios.get(`http://localhost:3001/api/dashboard/${userId}`);
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to fetch classes from API", err);
            }
        };

        fetchClass();
    }, [userId]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Your Classes</h1>

            <div style={{ padding: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                {role === "teacher" && (
                    <button onClick={() => navigate("/create-class")}>
                        Create Class
                    </button>
                )}

                {role === "student" && (
                    <button onClick={() => navigate("/join-class")}>
                        Join Class
                    </button>
                )}
            </div>

            <div>
                {classes.length === 0 ? (
                    <p>No joined classes yet.</p>
                ) : (
                    classes.map((c) => <ClassCard key={c.id} classData={c} />)
                )}
            </div>

             <button onClick={handleLogout} className="logout-btn">Log Out</button>
        </div>
    );
};

export default Dashboard;