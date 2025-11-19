import { useState } from 'react'
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import LogIn from './Pages/LogIn.jsx'
import SignUp from './Pages/SignUp.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
   <Router>
    <Routes>
      <Route path="/" element={<LogIn/>}/>
      <Route path="/login" element={<LogIn/>}/>
      <Route path="/signup" element={<SignUp/>}/>
    </Routes>
   </Router>
  )
}

export default App;
