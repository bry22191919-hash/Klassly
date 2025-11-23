import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const AssignmentForm = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [points, setPoints] = useState('')
  const [classId, setClassId] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const classes = [
    { id: 'class-1', name: 'Math 101' },
    { id: 'class-2', name: 'English 9' },
    { id: 'class-3', name: 'Science 7' },
  ]

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null)
  }

  const validate = () => {
    if (!title.trim()) return 'Title is required.'
    if (!description.trim()) return 'Description is required.'
    if (!dueDate) return 'Due date is required.'
    if (!points || isNaN(points)) return 'Points must be a number.'
    if (!classId) return 'Please select a class.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      alert(err)
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('dueDate', dueDate)
      formData.append('points', points)
      formData.append('classId', classId)
      if (file) formData.append('file', file)

      // Replace URL with your API endpoint when available
      const res = await axios.post('http://localhost:3001/api/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      alert('Assignment created successfully.' + (res.data?.id ? ` ID: ${res.data.id}` : ''))
      // reset form
      setTitle('')
      setDescription('')
      setDueDate('')
      setPoints('')
      setClassId('')
      setFile(null)
    } catch (err) {
      console.error(err)
      alert('Failed to create assignment. Check the console for details.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="assignment-form page-container">
      <h2>Create Assignment</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required />

        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />

        <label>Points</label>
        <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} required />

        <label>Class</label>
        <select value={classId} onChange={(e) => setClassId(e.target.value)} required>
          <option value="">Select class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label>Attach File (optional)</label>
        <input type="file" onChange={handleFileChange} />
        {file && <p>Selected file: {file.name}</p>}

        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Assignment'}</button>
      </form>

      <p>
        <Link to="/">Back to Login</Link>
      </p>
    </div>
  )
}

export default AssignmentForm
