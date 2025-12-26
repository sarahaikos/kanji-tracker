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
  // Get kanji for review
  getReviewKanji: async () => {
    const response = await api.get('/review/')
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
}

export default api

