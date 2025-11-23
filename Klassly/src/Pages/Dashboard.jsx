import { useEffect, useState } from "react";
import ClassCard from "../Components/ClassCards";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const navigate = useNavigate('');

    const userId = Number(localStorage.getItem("userId"));
    const role = localStorage.getItem("role");
    
    useEffect(() => {
        const fetchClass = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(`http://localhost:3001/api/classes/${userId}`);
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to fetch classes", err);
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

            <div style={{ padding: "20px" }}>
                {role === "teacher" && (
                    <button
                        onClick={() => navigate("/create-class")}
                        style={{ marginRight: "10px" }}
                    >
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
