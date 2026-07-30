import api from './axios';

// Each function matches one backend endpoint exactly.
// Components never write URLs themselves, they call these functions.

export const getSummary = async () => {
  const response = await api.get('/reports/summary');
  return response.data;
};

export const getByCategory = async () => {
  const response = await api.get('/reports/by-category');
  return response.data;
};

export const getExpiringSoon = async (days = 30) => {
  const response = await api.get(`/reports/expiring-soon?days=${days}`);
  return response.data;
};
