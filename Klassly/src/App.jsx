"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./Context/AuthContext"
import Landing from "./Pages/Landing"
import LogIn from "./Pages/LogIn"
import SignUp from "./Pages/SignUp"
import Dashboard from "./Pages/Dashboard"
import ClassPage from "./Pages/ClassPage"
import ClassSettingsPage from "./Pages/ClassSettingsPage"
import CreateClass from "./Pages/CreateClass"
import JoinClass from "./Pages/JoinClass"
import ProfilePage from "./Pages/ProfilePage"
import SettingsPage from "./Pages/SettingsPage"
import MainLayout from "./Components/MainLayout"
import LoadingSpinner from "./Components/LoadingSpinner"
import "./App.css"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LogIn />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/class/:classId" element={<ClassPage />} />
        <Route path="/class/:classId/settings" element={<ClassSettingsPage />} />
        <Route path="/create-class" element={<CreateClass />} />
        <Route path="/join-class" element={<JoinClass />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
