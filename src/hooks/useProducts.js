import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products';
import toast from 'react-hot-toast';

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });
};
