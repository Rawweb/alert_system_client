import { useQuery } from '@tanstack/react-query';
import { getSummary, getByCategory, getExpiringSoon } from '../api/reports';

// useQuery takes two things:
// 1. A queryKey: a unique name React Query uses as the cache label.
//    Think of it like the variable name for this piece of server data.
// 2. A queryFn: the function that actually fetches the data.
//    React Query calls this function automatically and re-calls it
//    on a schedule to keep data fresh.
//
// What comes back: { data, isLoading, isError, error }
// data: the fetched result (undefined while loading)
// isLoading: true while the first fetch is in progress
// isError: true if the fetch failed
// error: the error object if it failed

export const useSummary = () => {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: getSummary,
  });
};

export const useByCategory = () => {
  return useQuery({
    queryKey: ['reports', 'by-category'],
    queryFn: getByCategory,
  });
};

export const useExpiringSoon = (days = 30) => {
  return useQuery({
    queryKey: ['reports', 'expiring-soon', days],
    queryFn: () => getExpiringSoon(days),
  });
};
