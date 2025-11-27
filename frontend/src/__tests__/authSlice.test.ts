import authReducer, { logout, AuthState } from '../store/slices/authSlice';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout', () => {
    localStorageMock.setItem('token', 'test-token');
    const previousState: AuthState = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'EMPLOYEE' as any,
      },
      token: 'test-token',
      loading: false,
      error: null,
    };

    const state = authReducer(previousState, logout());
    expect(state).toEqual(initialState);
    expect(localStorageMock.getItem('token')).toBeNull();
  });

  it('should handle login.pending', () => {
    const action = { type: 'auth/login/pending' };
    const state = authReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle login.fulfilled', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'EMPLOYEE' as any,
    };

    const action = {
      type: 'auth/login/fulfilled',
      payload: {
        user,
        token: 'test-token',
      },
    };

    const state = authReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.user).toEqual(user);
    expect(state.token).toBe('test-token');
    expect(state.error).toBe(null);
  });

  it('should handle login.rejected', () => {
    const action = {
      type: 'auth/login/rejected',
      payload: 'Invalid credentials',
    };

    const state = authReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
  });
});
