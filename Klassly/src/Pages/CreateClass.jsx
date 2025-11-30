import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const CreateClass = () => {
    const [name, setClassName] = useState('');
    const [subject, setSubject] = useState('');

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
                name,
                subject,
                teacher_id, // already Number or null
                class_code
            });

            alert(`Class created successfully! Class code: ${class_code}`);
            setClassName('');
            setSubject('');
        } catch (err) {
            console.error(err);
            alert("Creation of class has failed.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Create a Class</h2>

            <form onSubmit={HandleSubmit}>
                <div>
                    <label>Class Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="Enter class name."
                    />
                </div>

                <div style={{ padding: "10px" }}>
                    <label>Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter subject"
                    />

                    <button type="submit" style={{ marginTop: "10px" }}>
                        Create Class
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateClass;
