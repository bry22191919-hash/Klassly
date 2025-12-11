import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './Pages/LogIn.jsx'
import SignUp from './Pages/SignUp.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import CreateClass from './Pages/CreateClass.jsx'
import JoinClass from './Pages/JoinClass.jsx'
import ClassPage from './Pages/ClassPage.jsx'
import ProfilePage from './Pages/ProfilePage.jsx'  // Make sure this is imported
import SettingsPage from './Pages/SettingsPage.jsx'
import ClassSettingsPage from './Pages/ClassSettingsPage.jsx'
import MainLayout from './Components/MainLayout.jsx'

function App() {
  return (
   <Router>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      
      {/* Protected Routes - Require authentication */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/create-class" element={<CreateClass/>}/>
        <Route path="/join-class" element={<JoinClass/>}/>
        <Route path="/class/:id" element={<ClassPage />} />
        <Route path="/class/:id/settings" element={<ClassSettingsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />  // This should be /profile/:id
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Login />} />
    </Routes>
   </Router>
  )
}

export default App;