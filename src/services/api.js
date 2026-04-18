import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000, 
});

export const interviewAPI = {
  startInterview: async (role,user_name) => {
    const response = await api.post(`/interview/start?role=${role}&user_name=${user_name }`);
    return response.data;
  },

  submitTextAnswer: async (idFromBackend, answer, role, questionText) => {
    const response = await api.post('/interview/submit-answer', null, {
      params: {
        user_id: idFromBackend, 
        user_answer: answer,
        role: role,
        question_text: questionText
      }
    });
    return response.data;
  },

  // 🎙️ Voice function
  submitAudioAnswer: async (userId, role, questionText, audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob); 
    const response = await api.post('/interview/submit-answer-audio', formData, {
      params: { user_id: userId, role: role, question_text: questionText },
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};