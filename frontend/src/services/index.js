import api from "./api";

// ================= SUBJECT =================
export const subjectService = {
  getAll: () => api.get("/subjects"),
  getById: (id) => api.get(`/subjects/${id}`),
  getByCode: (code) => api.get(`/subjects/code/${code}`),
};

// ================= PYQ =================
export const pyqService = {
  getAll: () => api.get("/pyq"),
  getById: (id) => api.get(`/pyq/${id}`),
  create: (payload) => api.post('/pyq', payload),
  remove: (id) => api.delete(`/pyq/${id}`),
};

// ================= PROGRESS =================
export const progressService = {
  getAll: () => api.get("/progress"),
  getBySubject: (subjectId) => api.get(`/progress/${subjectId}`),
  update: (data) => api.post("/progress/update", data),
  getRecommendations: () => api.get("/progress/recommendations"),
};

// ================= CHATBOT (🔥 FIXED) =================
export const chatbotService = {
  sendMessage: async (message, history = [], files = [], meta = {}) => {
    const formData = new FormData();

    // ✅ message
    formData.append("message", message || "");

    // ✅ history
    formData.append("history", JSON.stringify(history));

    // ✅ optional meta
    if (meta.model) formData.append("model", meta.model);
    if (meta.subjectId) formData.append("subjectId", meta.subjectId);
    if (meta.examYear) formData.append("examYear", meta.examYear);
    if (meta.examType) formData.append("examType", meta.examType);

    // 🔥 MULTIPLE FILES SUPPORT (IMPORTANT)
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("pdfs", file); // ✅ MUST MATCH BACKEND
      });
    }

    // 🔥 CORRECT ENDPOINT
    return api.post("/chatbot/chat", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 240000,
    });
  },
};

// ================= NOTES =================
export const notesService = {
  getAll: (params) => api.get("/notes", { params }),
  getBySubject: (subjectName) => api.get(`/notes/subject/${subjectName}`),
  getById: (id) => api.get(`/notes/${id}`),
  searchWeb: (q) => api.get('/notes/web-search', { params: { q } }),
};

// ================= VIDEOS =================
export const videoService = {
  getAll: (params) => api.get("/videos", { params }),
  getBySubject: (subjectName) => api.get(`/videos/subject/${subjectName}`),
};