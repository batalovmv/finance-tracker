import { Route, Routes } from 'react-router';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/auth.store';
import { mockUser } from '@/test/msw/handlers';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';

import LoginPage from '../login-page';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderLoginPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>Dashboard</div>} />
      <Route path="/register" element={<div>Register</div>} />
    </Routes>,
    { routerProps: { initialEntries: ['/login'] } },
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('should render email and password fields and submit button', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/электронная почта/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty submission', async () => {
    const { user } = renderLoginPage();

    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(await screen.findByText(/некорректный адрес/i)).toBeInTheDocument();
    expect(await screen.findByText(/пароль обязателен/i)).toBeInTheDocument();
  });

  it('should show validation error for invalid email format', async () => {
    const { user } = renderLoginPage();

    await user.type(screen.getByLabelText(/электронная почта/i), 'notanemail');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(await screen.findByText(/некорректный адрес/i)).toBeInTheDocument();
  });

  it('should navigate to / on successful login', async () => {
    const { user } = renderLoginPage();

    await user.type(screen.getByLabelText(/электронная почта/i), 'test@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Вход выполнен успешно');
  });

  it('should set auth store on successful login', async () => {
    const { user } = renderLoginPage();

    await user.type(screen.getByLabelText(/электронная почта/i), 'test@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('test-access-token');
    });
  });

  it('should show error toast on invalid credentials', async () => {
    const { user } = renderLoginPage();

    await user.type(screen.getByLabelText(/электронная почта/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Неверный email или пароль');
    });
  });

  it('should have link to register page', () => {
    renderLoginPage();

    const link = screen.getByRole('link', { name: /зарегистрироваться/i });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('should redirect to / when already authenticated', () => {
    useAuthStore.getState().setAuth(mockUser, 'token');
    renderLoginPage();

    expect(screen.queryByText('Войти')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
