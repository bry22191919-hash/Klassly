import { useEffect, useState } from "react";
import ClassCard from "../Components/ClassCards";
import axios from "axios";

const Dashboard = () => {
    const [classes, setClasses] = useState([]);

    const userId = localStorage.getItem("userId");
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

    return (
        <div style={{ padding: "20px" }}>
            <h1>Your Classes</h1>

            <div style={{ padding: "20px" }}>
                {role === "teacher" && (
                    <button
                        onClick={() => (window.location.href = "/create-class")}
                        style={{ marginRight: "10px" }}
                    >
                        Create Class
                    </button>
                )}

                {role === "student" && (
                    <button onClick={() => (window.location.href = "/join-class")}>
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
        </div>
    );
};

export default Dashboard;
