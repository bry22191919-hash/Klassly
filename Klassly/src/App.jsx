import { useState } from 'react'
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './Pages/LogIn.jsx'
import SignUp from './Pages/SignUp.jsx'
<<<<<<< HEAD
import Dashboard from './Pages/Dashboard.jsx'
=======
import AssignmentForm from './Pages/AssignmentForm.jsx'
>>>>>>> ab0a908bcb8ebe2dcb3b7ede87d0c9206908a370

function App() {


  return (
   <Router>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<SignUp/>}/>
<<<<<<< HEAD
      <Route path="/dashboard" element={<Dashboard/>}/>
=======
        <Route path="/assignments/new" element={<AssignmentForm/>}/>
>>>>>>> ab0a908bcb8ebe2dcb3b7ede87d0c9206908a370
    </Routes>
   </Router>
  )
}

export default App;
