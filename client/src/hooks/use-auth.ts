import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { type LoginInput, type RegisterInput } from '@shared/types';

import * as authApi from '@/api/auth.api';
import { type TranslationKey, useTranslation } from '@/i18n';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: ({ data: res }) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success(t('toast.loginSuccess'));
      navigate('/');
    },
    onError: (error) => {
      const code = axios.isAxiosError(error) ? error.response?.data?.error?.code : null;
      toast.error(code ? t(`error.${code}` as TranslationKey) : t('toast.loginError'));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: ({ data: res }) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success(t('toast.registerSuccess'));
      navigate('/');
    },
    onError: (error) => {
      const code = axios.isAxiosError(error) ? error.response?.data?.error?.code : null;
      toast.error(code ? t(`error.${code}` as TranslationKey) : t('toast.registerError'));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isAuthenticated,
  };
}

export function useSessionRestore() {
  const { setAuth, clearAuth } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const refreshRes = await authApi.refresh();
        const token = refreshRes.data.data.accessToken;
        // Set token before getMe so the request interceptor can attach it
        useAuthStore.getState().setToken(token);

        try {
          const meRes = await authApi.getMe();
          setAuth(meRes.data.data, token);
          return meRes.data.data;
        } catch {
          // getMe failed after refresh — clear partial state
          clearAuth();
          return null;
        }
      } catch {
        clearAuth();
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}
