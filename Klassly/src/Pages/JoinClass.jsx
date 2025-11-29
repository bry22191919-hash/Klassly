import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const JoinClass = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const studentId = Number(localStorage.getItem('userId'))

  useEffect(() => {
    axios.get('http://localhost:3001/api/classes')
      .then(res => setClasses(res.data || []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false))
  }, [])

  const handleJoin = async (classId) => {
    if (!studentId) {
      alert('Please log in as a student to join a class.')
      navigate('/login')
      return
    }
    setJoining(classId)
    try {
      await axios.post('http://localhost:3001/api/join-class', { classId, studentId })
      alert('Joined class successfully')
      // optionally navigate to class page
      navigate(`/class/${classId}`)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join class')
    } finally {
      setJoining(null)
    }
  }

  const handleJoinByCode = async () => {
    if (!code.trim()) return alert('Enter class code')
    try {
      const res = await axios.get(`http://localhost:3001/api/classes`)
      const found = (res.data || []).find(c => String(c.classCode) === String(code.trim()))
      if (!found) return alert('No class found with that code')
      await handleJoin(found.id)
    } catch (err) {
      alert('Failed to join by code')
    }
  }

  if (loading) return <p>Loading classes...</p>

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: 'auto' }}>
      <h2>Join a Class</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input placeholder="Enter class code" value={code} onChange={e => setCode(e.target.value)} />
        <button onClick={handleJoinByCode} style={{ marginLeft: '8px' }}>Join by Code</button>
      </div>

      <h3>Available Classes</h3>
      {classes.length === 0 ? (
        <p>No classes available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {classes.map(c => (
            <li key={c.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '0.5rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>{c.description}</div>
                  <div style={{ fontSize: '0.85rem', color: '#777' }}>Code: {c.classCode}</div>
                </div>
                <div>
                  <button onClick={() => handleJoin(c.id)} disabled={joining === c.id}>{joining === c.id ? 'Joining...' : 'Join'}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default JoinClass
