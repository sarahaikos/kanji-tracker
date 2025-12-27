import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { kanjiAPI } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const location = useLocation()
  const [stats, setStats] = useState({
    total_kanji: 0,
    mastered: 0,
    learning: 0,
    due_for_review: 0,
    streak: 0,
    mastery_progress: 0,
    mastery_levels: [],
  })
  const [expandedLevel, setExpandedLevel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
    
    // Refresh stats when component comes into focus (e.g., after returning from review)
    const handleFocus = () => {
      loadStats()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Refresh stats when navigating to Dashboard (e.g., returning from review)
  useEffect(() => {
    if (location.pathname === '/') {
      loadStats()
    }
  }, [location.pathname])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await kanjiAPI.getStats()
      setStats(data)
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load statistics'
      setError(errorMessage)
      console.error('Stats loading error:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      })
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

  // Use mastery_progress from backend if available, otherwise calculate from mastered count
  const masteryPercentage = stats.mastery_progress > 0 
    ? Math.round(stats.mastery_progress)
    : (stats.total_kanji > 0 
    ? Math.round((stats.mastered / stats.total_kanji) * 100) 
      : 0)

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

      {stats.mastery_levels && stats.mastery_levels.length > 0 && (
        <div className="mastery-levels-section">
          <h2 className="section-title">Kanji by Mastery Level</h2>
          <div className="mastery-levels-grid">
            {stats.mastery_levels.map((levelData) => (
              <div 
                key={levelData.level} 
                className="mastery-level-card"
                data-level={levelData.level}
              >
                <div 
                  className="mastery-level-header"
                  onClick={() => setExpandedLevel(expandedLevel === levelData.level ? null : levelData.level)}
                >
                  <div className="level-info">
                    <span className="level-label">
                      {levelData.level >= 5 ? 'Mastered' : `Level ${levelData.level}`}
                    </span>
                    <span className="level-count">{levelData.count} kanji</span>
                  </div>
                  <div className="level-actions">
                    <Link 
                      to={`/review?level=${levelData.level}`}
                      className="review-level-button"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Review
                    </Link>
                    <span className="expand-icon">
                      {expandedLevel === levelData.level ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
                {expandedLevel === levelData.level && (
                  <div className="kanji-list">
                    {levelData.kanji.map((kanji) => (
                      <div key={kanji.id} className="kanji-item">
                        <span className="kanji-character">{kanji.character}</span>
                        <span className="kanji-meaning">{kanji.meaning}</span>
                        <span className="kanji-stats">
                          {kanji.correct_count}/{kanji.review_count} correct
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

