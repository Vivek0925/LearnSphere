import api from './api';

export const subjectService = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  getByCode: (code) => api.get(`/subjects/code/${code}`),
};

export const pyqService = {
  getAll: () => api.get('/pyq'),
  getBySubject: (subjectId) => api.get(`/pyq/subject/${subjectId}`),
  getById: (id) => api.get(`/pyq/${id}`),
  upload: (formData) => api.post('/pyq/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const progressService = {
  getAll: () => api.get('/progress'),
  getBySubject: (subjectId) => api.get(`/progress/${subjectId}`),
  update: (data) => api.post('/progress/update', data),
  getRecommendations: () => api.get('/progress/recommendations'),
};

export const chatbotService = {
  sendMessage: (message, history = [], file = null, meta = {}) => {
    // If file attached → use FormData
    if (file) {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('message', message || '');
      formData.append('history', JSON.stringify(history));
      if (meta.subjectId) formData.append('subjectId', meta.subjectId);
      if (meta.examYear)  formData.append('examYear', meta.examYear);
      if (meta.examType)  formData.append('examType', meta.examType);
      return api.post('/chatbot/message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    // Normal text message
    return api.post('/chatbot/message', { message, history });
  }
};

export const notesService = {
  getAll: (params) => api.get('/notes', { params }),
  getBySubject: (subjectName) => api.get(`/notes/subject/${subjectName}`),
  getById: (id) => api.get(`/notes/${id}`),
};

export const videoService = {
  getAll: (params) => api.get('/videos', { params }),
  getBySubject: (subjectName) => api.get(`/videos/subject/${subjectName}`),
};
