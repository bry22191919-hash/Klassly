import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './Pages/LogIn.jsx'
import SignUp from './Pages/SignUp.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import AssignmentForm from './Pages/AssignmentForm.jsx'

function App() {

  return (
   <Router>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/assignments/new" element={<AssignmentForm/>}/>
      <Route path="/create-class" element={<CreateClass/>}/>
    </Routes>
   </Router>
  )
}

export default App;
