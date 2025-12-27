import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Kanji API
export const kanjiAPI = {
  // Get kanji for review, optionally filtered by mastery level or class
  getReviewKanji: async (masteryLevel = null, classLevel = null) => {
    const params = new URLSearchParams()
    if (masteryLevel !== null) {
      params.append('mastery_level', masteryLevel)
    }
    if (classLevel !== null) {
      params.append('class', classLevel)
    }
    const url = params.toString() ? `/review/?${params.toString()}` : '/review/'
    const response = await api.get(url)
    return response.data
  },

  // Submit review result
  submitReview: async (kanjiId, result) => {
    const response = await api.post('/review/', {
      kanji_id: kanjiId,
      result: result, // 'correct', 'incorrect', 'hard'
    })
    return response.data
  },

  // Get dashboard stats
  getStats: async () => {
    const response = await api.get('/stats/')
    return response.data
  },

  // Get all kanji
  getAllKanji: async () => {
    const response = await api.get('/kanji/')
    return response.data
  },

  // Add new kanji
  addKanji: async (kanjiData) => {
    const response = await api.post('/kanji/', kanjiData)
    return response.data
  },

  // Get kanji by class (grade level)
  getKanjiByClass: async (classNum) => {
    const response = await api.get(`/kanji/?class=${classNum}`)
    return response.data
  },
}

export default api

