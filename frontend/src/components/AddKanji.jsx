import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kanjiAPI } from '../services/api'
import './AddKanji.css'

function AddKanji() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    character: '',
    meaning: '',
    difficulty: 'medium',
    onyomi: [],
    kunyomi: [],
    examples: []
  })
  const [onyomiInput, setOnyomiInput] = useState('')
  const [kunyomiInput, setKunyomiInput] = useState('')
  const [exampleInput, setExampleInput] = useState({
    japanese: '',
    reading: '',
    meaning: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addReading = (type) => {
    const input = type === 'onyomi' ? onyomiInput : kunyomiInput
    if (input.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], input.trim()]
      }))
      if (type === 'onyomi') {
        setOnyomiInput('')
      } else {
        setKunyomiInput('')
      }
    }
  }

  const removeReading = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const addExample = () => {
    if (exampleInput.japanese.trim() && exampleInput.meaning.trim()) {
      setFormData(prev => ({
        ...prev,
        examples: [...prev.examples, { ...exampleInput }]
      }))
      setExampleInput({ japanese: '', reading: '', meaning: '' })
    }
  }

  const removeExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!formData.character.trim()) {
      setError('Kanji character is required')
      setLoading(false)
      return
    }

    if (!formData.meaning.trim()) {
      setError('Meaning is required')
      setLoading(false)
      return
    }

    try {
      const kanjiData = {
        character: formData.character.trim(),
        meaning: formData.meaning.trim(),
        difficulty: formData.difficulty,
        onyomi: formData.onyomi,
        kunyomi: formData.kunyomi,
        example_data: formData.examples
      }

      await kanjiAPI.addKanji(kanjiData)
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      // Handle both 'error' (single message) and 'errors' (validation errors) formats
      const errorData = err.response?.data
      if (errorData?.error) {
        setError(errorData.error)
      } else if (errorData?.errors) {
        // Handle validation errors - format them nicely
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`
            }
            return `${field}: ${messages}`
          })
          .join('\n')
        setError(errorMessages)
      } else {
        setError(err.message || 'Failed to add kanji')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-kanji">
      <div className="add-kanji-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back
        </button>
        <h1>Add New Kanji</h1>
        <p className="subtitle">Add a kanji you've learned to your collection</p>
      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert success">
          Kanji added successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="kanji-form">
        <div className="form-section">
          <label htmlFor="character">
            Kanji Character <span className="required">*</span>
          </label>
          <input
            type="text"
            id="character"
            name="character"
            value={formData.character}
            onChange={handleInputChange}
            placeholder="何"
            maxLength="1"
            required
            className="kanji-input"
          />
          <small>Enter a single kanji character</small>
        </div>

        <div className="form-section">
          <label htmlFor="meaning">
            Meaning <span className="required">*</span>
          </label>
          <textarea
            id="meaning"
            name="meaning"
            value={formData.meaning}
            onChange={handleInputChange}
            rows="3"
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-section">
          <label>Onyomi Readings (音読み)</label>
          <div className="reading-input-group">
            <input
              type="text"
              value={onyomiInput}
              onChange={(e) => setOnyomiInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addReading('onyomi')
                }
              }}
              className="reading-input"
            />
            <button
              type="button"
              onClick={() => addReading('onyomi')}
              className="add-button"
            >
              Add
            </button>
          </div>
          {formData.onyomi.length > 0 && (
            <div className="reading-tags">
              {formData.onyomi.map((reading, idx) => (
                <span key={idx} className="reading-tag">
                  {reading}
                  <button
                    type="button"
                    onClick={() => removeReading('onyomi', idx)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <label>Kunyomi Readings (訓読み)</label>
          <div className="reading-input-group">
            <input
              type="text"
              value={kunyomiInput}
              onChange={(e) => setKunyomiInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addReading('kunyomi')
                }
              }}
              className="reading-input"
            />
            <button
              type="button"
              onClick={() => addReading('kunyomi')}
              className="add-button"
            >
              Add
            </button>
          </div>
          {formData.kunyomi.length > 0 && (
            <div className="reading-tags">
              {formData.kunyomi.map((reading, idx) => (
                <span key={idx} className="reading-tag">
                  {reading}
                  <button
                    type="button"
                    onClick={() => removeReading('kunyomi', idx)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <label>Examples (Optional)</label>
          <div className="example-input-group">
            <input
              type="text"
              placeholder="Japanese text"
              value={exampleInput.japanese}
              onChange={(e) => setExampleInput({ ...exampleInput, japanese: e.target.value })}
              className="example-input"
            />
            <input
              type="text"
              placeholder="Reading (hiragana)"
              value={exampleInput.reading}
              onChange={(e) => setExampleInput({ ...exampleInput, reading: e.target.value })}
              className="example-input"
            />
            <input
              type="text"
              placeholder="Meaning"
              value={exampleInput.meaning}
              onChange={(e) => setExampleInput({ ...exampleInput, meaning: e.target.value })}
              className="example-input"
            />
            <button
              type="button"
              onClick={addExample}
              className="add-button"
            >
              Add Example
            </button>
          </div>
          {formData.examples.length > 0 && (
            <div className="examples-list">
              {formData.examples.map((example, idx) => (
                <div key={idx} className="example-item">
                  <div className="example-content">
                    <strong>{example.japanese}</strong>
                    {example.reading && <span className="example-reading">({example.reading})</span>}
                    <span className="example-meaning"> - {example.meaning}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExample(idx)}
                    className="remove-example"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Adding...' : 'Add Kanji'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddKanji

