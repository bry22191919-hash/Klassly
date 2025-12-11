import { useEffect, useState } from "react";
import ClassCard from "../Components/ClassCards.jsx"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../app.css";

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const currentUser = {
        id: localStorage.getItem("userId") ?? localStorage.getItem("id"),
        name: localStorage.getItem("name") || "John Doe",
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser.id) {
            navigate("/login");
        }
    }, [currentUser.id, navigate]);

    useEffect(() => {
        const fetchClass = async () => {
            if (!currentUser.id) return; // Don't fetch if not logged in

            try {
                const res = await axios.get(`http://localhost:3001/api/dashboard/${currentUser.id}`);
                setClasses(res.data || []);
            } catch (err) {
                console.error("Failed to fetch classes", err);
                setClasses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchClass();
    }, [currentUser.id]);

    if (!currentUser.id) return null; // Don't render anything while redirecting

    return (
        <div style={{
            marginLeft: "240px",
            padding: "24px",
            background: "#f8f9fa",
            minHeight: "100vh"
        }}>
            {/* Header Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "32px", color: "#2d3748", fontWeight: "bold", marginBottom: "8px" }}>
                        Welcome back, {currentUser.name}!
                    </h1>
                    <p style={{ fontSize: "16px", color: "#4a5568", marginBottom: "24px" }}>
                        Manage your classes and assignments
                    </p>
                </div>
                
                <button
                    onClick={() => navigate("/create-class")}
                    style={{
                        padding: "12px 24px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s"
                    }}
                >
                    <span>➕</span>
                    <span>Create Class</span>
                </button>
            </div>

            {/* Class Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", padding: "0 20px" }}>
                {loading ? (
                    <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>Loading classes...</p>
                ) : classes.length === 0 ? (
                    <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>No joined classes yet.</p>
                ) : (
                    classes.map((c) => <ClassCard key={c.id} classData={c} />)
                )}
            </div>
        </div>
    );
};

export default Dashboard;
