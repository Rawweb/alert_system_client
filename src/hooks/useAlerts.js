import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAlerts,
  getUnreadCount,
  markAlertAsRead,
  markAllAlertsAsRead,
} from '../api/alerts';
import toast from 'react-hot-toast';

export const useAlerts = (unreadOnly = false) => {
  return useQuery({
    queryKey: ['alerts', { unreadOnly }],
    queryFn: () => getAlerts(unreadOnly),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: getUnreadCount,
    // Refetch every 60 seconds so the bell badge stays current
    // without the admin manually refreshing the page
    refetchInterval: 60000,
  });
};

// useMutation is React Query's tool for write operations:
// POST, PATCH, DELETE. Unlike useQuery which runs automatically,
// a mutation only runs when you call mutate() or mutateAsync().
export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => markAlertAsRead(id),
    onSuccess: () => {
      // After marking one read, invalidate the cached alerts so
      // React Query re-fetches fresh data automatically.
      // This is how the unread count badge updates without a page refresh.
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert marked as read');
    },
    onError: () => {
      toast.error('Failed to mark alert as read');
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAlertsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('All alerts marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all alerts as read');
    },
  });
};
