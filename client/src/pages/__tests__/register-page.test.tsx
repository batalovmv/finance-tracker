import { Route, Routes } from 'react-router';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/auth.store';
import { mockUser } from '@/test/msw/handlers';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';

import RegisterPage from '../register-page';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderRegisterPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<div>Dashboard</div>} />
      <Route path="/login" element={<div>Login</div>} />
    </Routes>,
    { routerProps: { initialEntries: ['/register'] } },
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('should render name, email, password fields and submit button', () => {
    renderRegisterPage();

    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/электронная почта/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /создать аккаунт/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty submission', async () => {
    const { user } = renderRegisterPage();

    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(await screen.findByText(/имя обязательно/i)).toBeInTheDocument();
    expect(await screen.findByText(/некорректный адрес/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/пароль должен содержать не менее 8 символов/i),
    ).toBeInTheDocument();
  });

  it('should show validation error for invalid email format', async () => {
    const { user } = renderRegisterPage();

    await user.type(screen.getByLabelText(/имя/i), 'Test User');
    await user.type(screen.getByLabelText(/электронная почта/i), 'notanemail');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(await screen.findByText(/некорректный адрес/i)).toBeInTheDocument();
  });

  it('should show validation error for short password', async () => {
    const { user } = renderRegisterPage();

    await user.type(screen.getByLabelText(/имя/i), 'Test User');
    await user.type(screen.getByLabelText(/электронная почта/i), 'test@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'short');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(
      await screen.findByText(/пароль должен содержать не менее 8 символов/i),
    ).toBeInTheDocument();
  });

  it('should navigate to / on successful registration', async () => {
    const { user } = renderRegisterPage();

    await user.type(screen.getByLabelText(/имя/i), 'New User');
    await user.type(screen.getByLabelText(/электронная почта/i), 'new@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Аккаунт создан успешно');
  });

  it('should set auth store on successful registration', async () => {
    const { user } = renderRegisterPage();

    await user.type(screen.getByLabelText(/имя/i), 'New User');
    await user.type(screen.getByLabelText(/электронная почта/i), 'new@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('new@example.com');
      expect(state.accessToken).toBe('new-access-token');
    });
  });

  it('should show error toast when email already exists', async () => {
    const { user } = renderRegisterPage();

    await user.type(screen.getByLabelText(/имя/i), 'Existing User');
    await user.type(screen.getByLabelText(/электронная почта/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Этот email уже зарегистрирован');
    });
  });

  it('should have link to login page', () => {
    renderRegisterPage();

    const link = screen.getByRole('link', { name: /войти/i });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('should redirect to / when already authenticated', () => {
    useAuthStore.getState().setAuth(mockUser, 'token');
    renderRegisterPage();

    expect(screen.queryByText('Создать аккаунт')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
