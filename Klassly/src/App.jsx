import { useState } from 'react'
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './Pages/LogIn.jsx'
import SignUp from './Pages/SignUp.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import CreateClass from './Pages/CreateClass.jsx'
import JoinClass from './Pages/JoinClass.jsx'
import ClassPage from './Pages/ClassPage.jsx'



function App() {

  return (
   <Router>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/create-class" element={<CreateClass/>}/>
      <Route path="/join-class" element={<JoinClass/>}/>
      <Route path="/class/:id" element={<ClassPage />} />
    </Routes>
   </Router>
  )
}

export default App;
