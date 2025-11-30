import { useEffect, useState } from "react";
import ClassCard from "../Components/ClassCards";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // read user id from either 'userId' or legacy 'id'
    const storedId = localStorage.getItem("userId") ?? localStorage.getItem("id");
    const userId = storedId ? Number(storedId) : null;
    const role = localStorage.getItem("role");
    
    useEffect(() => {
        const fetchClass = async () => {
            console.log("userId:", userId);
            if (userId === null || isNaN(userId)) {
                console.warn("No valid userId found");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`http://localhost:3001/api/dashboard/${userId}`);
                console.log("Fetched classes:", res.data);
                setClasses(res.data || []);
            } catch (err) {
                console.error("Failed to fetch classes", err);
                setClasses([]);
            } finally {
                setLoading(false);
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

            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {loading ? (
                    <p>Loading classes...</p>
                ) : classes.length === 0 ? (
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