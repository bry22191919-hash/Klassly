import { useState } from 'react'
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './Pages/LogIn.jsx'
import SignUp from './Pages/SignUp.jsx'
import AssignmentForm from './Pages/AssignmentForm.jsx'
import ClassList from './Pages/ClassList.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import JoinClass from './Pages/JoinClass.jsx'
import ClassPage from './Pages/ClassPage.jsx'

function App() {


  return (
   <Router>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/classes" element={<ClassList/>}/>
      <Route path="/home" element={<Dashboard/>}/>
      <Route path="/join-class" element={<JoinClass/>}/>
        <Route path="/class/:classId" element={<ClassPage/>}/>
      <Route path="/assignments/new" element={<AssignmentForm/>}/>
    </Routes>
   </Router>
  )
}

export default App;
