import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('mf_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: d => api.post('/auth/login', d),
};

export const patientApi = {
  register: d   => api.post('/patients', d),
  getAll:   (page=0, q='') => api.get(`/patients?page=${page}&q=${q}`),
  getById:  id  => api.get(`/patients/${id}`),
  getByCode:code => api.get(`/patients/code/${code}`),
};

export const doctorApi = {
  getAll:    () => api.get('/doctors'),
  getAvailable: () => api.get('/doctors/available'),
};

export const appointmentApi = {
  book:        d          => api.post('/appointments', d),
  byPatient:   pid        => api.get(`/appointments/patient/${pid}`),
  doctorQueue: (did, date)=> api.get(`/appointments/doctor/${did}/queue?date=${date}`),
  slots:       (did, date)=> api.get(`/appointments/doctor/${did}/slots?date=${date}`),
  queueSummary: ()        => api.get('/appointments/queue/summary'),
  dashboardStats: ()      => api.get('/appointments/dashboard/stats'),
  start:       id         => api.put(`/appointments/${id}/start`),
  complete:    id         => api.put(`/appointments/${id}/complete`),
  cancel:      (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
};

export const prescriptionApi = {
  issue:   d   => api.post('/prescriptions', d),
  history: pid => api.get(`/prescriptions/patient/${pid}`),
  getById: id  => api.get(`/prescriptions/${id}`),
};

export default api;
