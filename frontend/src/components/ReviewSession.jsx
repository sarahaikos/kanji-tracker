import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { kanjiAPI } from '../services/api'
import './ReviewSession.css'

function ReviewSession() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const masteryLevel = searchParams.get('level')
  const classLevel = searchParams.get('class')
  const [kanji, setKanji] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadNextKanji()
  }, [masteryLevel, classLevel])

  const loadNextKanji = async () => {
    try {
      setLoading(true)
      setShowAnswer(false)
      
      const level = masteryLevel ? parseInt(masteryLevel) : null
      const classNum = classLevel ? parseInt(classLevel) : null
      const data = await kanjiAPI.getReviewKanji(level, classNum)
      setKanji(data)
    } catch (err) {
      console.error('Failed to load kanji:', err)
      if (err.response?.status === 404) {
        setKanji(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (result) => {
    if (!kanji || submitting) return

    try {
      setSubmitting(true)
      
      // Submit review result
      await kanjiAPI.submitReview(kanji.id, result)
      
      // Update stats
      setSessionStats(prev => ({
        total: prev.total + 1,
        correct: result === 'correct' ? prev.correct + 1 : prev.correct,
        incorrect: result !== 'correct' ? prev.incorrect + 1 : prev.incorrect,
      }))

      // Small delay for feedback
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load next kanji
      loadNextKanji()
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !kanji) {
    return (
      <div className="review-session">
        <div className="loading">Loading kanji...</div>
      </div>
    )
  }

  if (!kanji) {
    return (
      <div className="review-session">
        <div className="no-kanji">
          <h2>
            {masteryLevel 
              ? `No kanji available for review at mastery level ${masteryLevel}`
              : classLevel
              ? `No kanji available for review in class ${classLevel}`
              : 'No kanji available for review'}
          </h2>
          <button onClick={() => navigate('/')} className="back-button">
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="review-session">
      <div className="review-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back
        </button>
        <div className="review-info">
          {masteryLevel && (
            <div className="mastery-level-badge">
              Reviewing Level {parseInt(masteryLevel) >= 5 ? 'Mastered' : masteryLevel}
            </div>
          )}
          {classLevel && (
            <div className="class-level-badge">
              Class {classLevel}
            </div>
          )}
        <div className="session-stats">
          <span>Total: {sessionStats.total}</span>
          <span className="correct">✓ {sessionStats.correct}</span>
          <span className="incorrect">✗ {sessionStats.incorrect}</span>
          </div>
        </div>
      </div>

      <div className="flashcard-container">
        <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
          <div className="flashcard-front">
            <div className="kanji-display">
              <div className="kanji-character">{kanji.character}</div>
              <button 
                className="reveal-button"
                onClick={() => setShowAnswer(true)}
              >
                Show Answer
              </button>
            </div>
          </div>

          <div className="flashcard-back">
            <div className="kanji-info">
              <div className="kanji-character-large">{kanji.character}</div>
              
              <div className="kanji-details">
                <div className="detail-section">
                  <h3>Meaning</h3>
                  <p>{kanji.meaning}</p>
                </div>

                {kanji.readings.onyomi.length > 0 && (
                  <div className="detail-section">
                    <h3>Onyomi (音読み)</h3>
                    <div className="readings">
                      {kanji.readings.onyomi.map((reading, idx) => (
                        <span key={idx} className="reading-tag">{reading}</span>
                      ))}
                    </div>
                  </div>
                )}

                {kanji.readings.kunyomi.length > 0 && (
                  <div className="detail-section">
                    <h3>Kunyomi (訓読み)</h3>
                    <div className="readings">
                      {kanji.readings.kunyomi.map((reading, idx) => (
                        <span key={idx} className="reading-tag">{reading}</span>
                      ))}
                    </div>
                  </div>
                )}

                {kanji.examples && kanji.examples.length > 0 && (
                  <div className="detail-section">
                    <h3>Examples</h3>
                    <div className="examples">
                      {kanji.examples.map((example, idx) => (
                        <div key={idx} className="example-item">
                          <div className="example-japanese">
                            <span className="example-kanji">{example.japanese}</span>
                            <span className="example-reading">{example.reading}</span>
                          </div>
                          <div className="example-meaning">{example.meaning}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAnswer && (
        <div className="answer-buttons">
          <button
            className="answer-button incorrect"
            onClick={() => handleAnswer('incorrect')}
            disabled={submitting}
          >
            <span className="button-icon">✗</span>
            <span>Incorrect</span>
          </button>
          <button
            className="answer-button hard"
            onClick={() => handleAnswer('hard')}
            disabled={submitting}
          >
            <span className="button-icon">⚠</span>
            <span>Hard</span>
          </button>
          <button
            className="answer-button correct"
            onClick={() => handleAnswer('correct')}
            disabled={submitting}
          >
            <span className="button-icon">✓</span>
            <span>Correct</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewSession

