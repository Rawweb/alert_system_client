import api from './axios';

export const getAlerts = async (unreadOnly = false) => {
  const url = unreadOnly ? '/alerts?unread=true' : '/alerts';
  const response = await api.get(url);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/alerts/unread-count');
  return response.data;
};

export const markAlertAsRead = async (id) => {
  const response = await api.patch(`/alerts/${id}/read`);
  return response.data;
};

export const markAllAlertsAsRead = async () => {
  const response = await api.patch('/alerts/read-all');
  return response.data;
};
