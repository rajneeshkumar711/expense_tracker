import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  Expense,
  CreateExpenseData,
  Analytics,
  ExpenseStatus,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/login', credentials);
    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/register', userData);
    return data;
  }

  async getCurrentUser() {
    const { data } = await this.api.get('/auth/me');
    return data;
  }

  // Expense endpoints
  async createExpense(expenseData: CreateExpenseData): Promise<Expense> {
    const { data } = await this.api.post<Expense>('/expenses', expenseData);
    return data;
  }

  async getExpenses(params?: {
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<Expense[]> {
    const { data } = await this.api.get<Expense[]>('/expenses', { params });
    return data;
  }

  async updateExpenseStatus(id: string, status: ExpenseStatus): Promise<Expense> {
    const { data } = await this.api.patch<Expense>(`/expenses/${id}/status`, { status });
    return data;
  }

  async getAnalytics(params?: { startDate?: string; endDate?: string }): Promise<Analytics> {
    const { data } = await this.api.get<Analytics>('/expenses/analytics', { params });
    return data;
  }
}

export default new ApiService();
