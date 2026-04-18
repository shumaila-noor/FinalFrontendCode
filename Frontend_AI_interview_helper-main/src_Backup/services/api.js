import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const interviewAPI = {
  startInterview: async (role) => {
    const response = await api.post(`/interview/start?role=${role}`);
    return response.data;
  },

  submitTextAnswer: async (idFromBackend, answer, role, questionText) => {
    // ✅ FIX: Changed null to {} so POST body is not empty/broken
    const response = await api.post('/interview/submit-answer', {}, {
      params: {
        user_id: idFromBackend,
        user_answer: answer,
        role: role,
        question_text: questionText
      }
    });
    return response.data;
  }
};