import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { kanjiAPI } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    total_kanji: 0,
    mastered: 0,
    learning: 0,
    due_for_review: 0,
    streak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await kanjiAPI.getStats()
      setStats(data)
    } catch (err) {
      setError('Failed to load statistics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
      </div>
    )
  }

  const masteryPercentage = stats.total_kanji > 0 
    ? Math.round((stats.mastered / stats.total_kanji) * 100) 
    : 0

  return (
    <div className="dashboard">

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.total_kanji}</div>
            <div className="stat-label">Total Kanji</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.mastered}</div>
            <div className="stat-label">Mastered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.learning}</div>
            <div className="stat-label">Learning</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-content">
            <div className="stat-value">{stats.due_for_review}</div>
            <div className="stat-label">Due for Review</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-card">
          <div className="progress-header">
            <h2>Mastery Progress</h2>
            <span className="progress-percentage">{masteryPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${masteryPercentage}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <span>{stats.mastered} mastered</span>
            <span>{stats.total_kanji - stats.mastered} remaining</span>
          </div>
        </div>

        <div className="streak-card">
          <div className="streak-content">
            <div className="streak-value">{stats.streak}</div>
            <div className="streak-label">Day Streak</div>
            <div className="streak-subtitle">Keep it up!</div>
          </div>
        </div>
      </div>

      <div className="action-section">
        <div className="action-buttons">
          <Link to="/add" className="action-button secondary">
            <span>+ Add Kanji</span>
          </Link>
          <Link to="/review" className="action-button primary">
            <span>Start Review Session</span>
            <span className="button-icon">→</span>
          </Link>
        </div>
        {stats.due_for_review > 0 && (
          <div className="review-badge">
            {stats.due_for_review} kanji ready for review
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

