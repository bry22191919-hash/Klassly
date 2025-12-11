import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
    const [name, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [section, setSection] = useState('');
    const [room, setRoom] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    // use either 'userId' or legacy 'id'
    const storedId = localStorage.getItem("userId") ?? localStorage.getItem("id");
    const teacher_id = storedId ? Number(storedId) : null;
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (role !== "teacher") {
            alert("Only teachers can create classes!");
        }
    }, [role]);

    const HandleSubmit = async (e) => {
        e.preventDefault();

        if (role !== "teacher") {
            alert("You are not allowed to create a class.");
            return;
        }

        const class_code = uuidv4().split('-')[0].toUpperCase();

        try {
            await axios.post("http://localhost:3001/api/create-classes", {
                name, subject, teacher_id, class_code
            });

            alert(`Class created successfully! Class code: ${class_code}`);
            setClassName('');
            setSubject('');
            
        } catch (err) {
            console.error(err);
            alert("Creation of class has failed.");
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    return (
        <div style={{ 
            maxWidth: "600px", 
            margin: "0 auto", 
            padding: "40px 20px" 
        }}>
            <h1 style={{ 
                fontSize: "28px", 
                fontWeight: "bold", 
                color: "#2d3748", 
                marginBottom: "8px" 
            }}>
                Create a New Class
            </h1>
            <p style={{ 
                fontSize: "16px", 
                color: "#4a5568", 
                marginBottom: "32px" 
            }}>
                Fill in the details to create your class
            </p>

            <form onSubmit={HandleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "500", 
                        color: "#2d3748" 
                    }}>
                        Class Name <span style={{ color: "#e53e3e" }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="e.g., Mathematics 101"
                        style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "1px solid #e2e8f0", 
                            borderRadius: "8px", 
                            fontSize: "16px" 
                        }}
                        required
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#2d3748" 
                        }}>
                            Subject <span style={{ color: "#e53e3e" }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Mathematics"
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "1px solid #e2e8f0", 
                                borderRadius: "8px", 
                                fontSize: "16px" 
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#2d3748" 
                        }}>
                            Section
                        </label>
                        <input
                            type="text"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            placeholder="e.g., Section A"
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                border: "1px solid #e2e8f0", 
                                borderRadius: "8px", 
                                fontSize: "16px" 
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "500", 
                        color: "#2d3748" 
                    }}>
                        Room
                    </label>
                    <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="e.g., Room 201"
                        style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "1px solid #e2e8f0", 
                            borderRadius: "8px", 
                            fontSize: "16px" 
                        }}
                    />
                </div>

                <div style={{ marginBottom: "32px" }}>
                    <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "500", 
                        color: "#2d3748" 
                    }}>
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of the class..."
                        style={{ 
                            width: "100%", 
                            padding: "12px", 
                            border: "1px solid #e2e8f0", 
                            borderRadius: "8px", 
                            fontSize: "16px", 
                            minHeight: "120px", 
                            resize: "vertical" 
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                    <button 
                        type="submit" 
                        style={{ 
                            flex: 1, 
                            padding: "14px 24px", 
                            background: "#3b82f6", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "8px", 
                            fontSize: "16px", 
                            fontWeight: "500", 
                            cursor: "pointer",
                            transition: "background 0.2s"
                        }}
                    >
                        Create Class
                    </button>
                    <button 
                        type="button" 
                        onClick={handleCancel}
                        style={{ 
                            flex: 1, 
                            padding: "14px 24px", 
                            background: "white", 
                            color: "#4a5568", 
                            border: "1px solid #e2e8f0", 
                            borderRadius: "8px", 
                            fontSize: "16px", 
                            fontWeight: "500", 
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateClass;