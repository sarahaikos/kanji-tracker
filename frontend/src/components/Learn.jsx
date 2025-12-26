import { useState, useEffect } from 'react'
import { kanjiAPI } from '../services/api'
import './Learn.css'

function Learn() {
  const [selectedClass, setSelectedClass] = useState(null)
  const [kanjiList, setKanjiList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentKanji, setCurrentKanji] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const classes = [1, 2, 3, 4, 5, 6]

  useEffect(() => {
    if (selectedClass) {
      loadKanjiForClass(selectedClass)
    }
  }, [selectedClass])

  const loadKanjiForClass = async (classNum) => {
    try {
      setLoading(true)
      setError(null)
      const data = await kanjiAPI.getKanjiByClass(classNum)
      setKanjiList(data)
      if (data.length > 0) {
        setCurrentKanji(data[0])
        setShowAnswer(false)
      } else {
        setCurrentKanji(null)
      }
    } catch (err) {
      setError('Failed to load kanji for this class')
      console.error(err)
      setKanjiList([])
      setCurrentKanji(null)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentKanji && kanjiList.length > 0) {
      const currentIndex = kanjiList.findIndex(k => k.id === currentKanji.id)
      const nextIndex = (currentIndex + 1) % kanjiList.length
      setCurrentKanji(kanjiList[nextIndex])
      setShowAnswer(false)
    }
  }

  const handlePrevious = () => {
    if (currentKanji && kanjiList.length > 0) {
      const currentIndex = kanjiList.findIndex(k => k.id === currentKanji.id)
      const prevIndex = (currentIndex - 1 + kanjiList.length) % kanjiList.length
      setCurrentKanji(kanjiList[prevIndex])
      setShowAnswer(false)
    }
  }

  if (!selectedClass) {
    return (
      <div className="learn">
        <div className="learn-header">
          <h1>Learn Kanji</h1>
          <p className="subtitle">Select a class to start learning</p>
        </div>

        <div className="class-selection">
          <div className="class-grid">
            {classes.map((classNum) => (
              <button
                key={classNum}
                className="class-card"
                onClick={() => setSelectedClass(classNum)}
              >
                <div className="class-number">{classNum} 年生</div>
                <div className="class-label">Grade {classNum} Kanji</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="learn">
        <div className="loading">Loading kanji...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="learn">
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => setSelectedClass(null)}>
          ← Back to Class Selection
        </button>
      </div>
    )
  }

  if (kanjiList.length === 0) {
    return (
      <div className="learn">
        <div className="no-kanji">
          <h2>No kanji found for Class {selectedClass}</h2>
          <p>Add kanji data for this class to start learning.</p>
          <button className="back-button" onClick={() => setSelectedClass(null)}>
            ← Back to Class Selection
          </button>
        </div>
      </div>
    )
  }

  const currentIndex = kanjiList.findIndex(k => k.id === currentKanji.id) + 1

  return (
    <div className="learn">
      <div className="learn-header">
        <button className="back-button" onClick={() => setSelectedClass(null)}>
          ← Back to Classes
        </button>
        <h1>Class {selectedClass} Kanji</h1>
        <div className="progress-indicator">
          {currentIndex} / {kanjiList.length}
        </div>
      </div>

      <div className="learn-card-container">
        <div className={`learn-card ${showAnswer ? 'flipped' : ''}`}>
          <div className="learn-card-front">
            <div className="kanji-display">
              <div className="kanji-character-large">{currentKanji.character}</div>
              <button 
                className="reveal-button"
                onClick={() => setShowAnswer(true)}
              >
                Show Answer
              </button>
            </div>
          </div>

          <div className="learn-card-back">
            <div className="kanji-info">
              <div className="kanji-character-display">{currentKanji.character}</div>
              
              <div className="kanji-details">
                <div className="detail-section">
                  <h3>Meaning</h3>
                  <p>{currentKanji.meaning}</p>
                </div>

                {currentKanji.readings?.onyomi?.length > 0 && (
                  <div className="detail-section">
                    <h3>Onyomi (音読み)</h3>
                    <div className="readings">
                      {currentKanji.readings.onyomi.map((reading, idx) => (
                        <span key={idx} className="reading-tag">{reading}</span>
                      ))}
                    </div>
                  </div>
                )}

                {currentKanji.readings?.kunyomi?.length > 0 && (
                  <div className="detail-section">
                    <h3>Kunyomi (訓読み)</h3>
                    <div className="readings">
                      {currentKanji.readings.kunyomi.map((reading, idx) => (
                        <span key={idx} className="reading-tag">{reading}</span>
                      ))}
                    </div>
                  </div>
                )}

                {currentKanji.examples && currentKanji.examples.length > 0 && (
                  <div className="detail-section">
                    <h3>Examples</h3>
                    <div className="examples">
                      {currentKanji.examples.map((example, idx) => (
                        <div key={idx} className="example-item">
                          <div className="example-japanese">
                            <span className="example-kanji">{example.japanese}</span>
                            {example.reading && (
                              <span className="example-reading">({example.reading})</span>
                            )}
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

      <div className="navigation-buttons">
        <button className="nav-button prev" onClick={handlePrevious}>
          ← Previous
        </button>
        <button className="nav-button next" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  )
}

export default Learn

