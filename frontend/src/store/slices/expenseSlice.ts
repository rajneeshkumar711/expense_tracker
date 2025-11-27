import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Expense, CreateExpenseData, ExpenseStatus, Analytics } from '../../types';

export interface ExpenseState {
  expenses: Expense[];
  analytics: Analytics | null;
  loadingExpenses: boolean;
  loadingAnalytics: boolean;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  analytics: null,
  loadingExpenses: false,
  loadingAnalytics: false,
  loadingCreate: false,
  loadingUpdate: false,
  error: null,
};

export const createExpense = createAsyncThunk(
  'expense/create',
  async (expenseData: CreateExpenseData, { rejectWithValue }) => {
    try {
      const expense = await api.createExpense(expenseData);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create expense');
    }
  }
);

export const fetchExpenses = createAsyncThunk(
  'expense/fetchAll',
  async (
    params: {
      category?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      userId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const expenses = await api.getExpenses(params);
      return expenses;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch expenses');
    }
  }
);

export const updateExpenseStatus = createAsyncThunk(
  'expense/updateStatus',
  async ({ id, status }: { id: string; status: ExpenseStatus }, { rejectWithValue }) => {
    try {
      const expense = await api.updateExpenseStatus(id, status);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update expense');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'expense/fetchAnalytics',
  async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const analytics = await api.getAnalytics(params);
      return analytics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch analytics');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateExpenseInList: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    addExpenseToList: (state, action: PayloadAction<Expense>) => {
      // Check if expense already exists
      const exists = state.expenses.some((e) => e.id === action.payload.id);
      if (!exists) {
        state.expenses.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Create expense
    builder.addCase(createExpense.pending, (state) => {
      state.loadingCreate = true;
      state.error = null;
    });
    builder.addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
      state.loadingCreate = false;
      state.expenses.unshift(action.payload);
    });
    builder.addCase(createExpense.rejected, (state, action) => {
      state.loadingCreate = false;
      state.error = action.payload as string;
    });

    // Fetch expenses
    builder.addCase(fetchExpenses.pending, (state) => {
      state.loadingExpenses = true;
      state.error = null;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
      state.loadingExpenses = false;
      state.expenses = action.payload;
    });
    builder.addCase(fetchExpenses.rejected, (state, action) => {
      state.loadingExpenses = false;
      state.error = action.payload as string;
    });

    // Update expense status
    builder.addCase(updateExpenseStatus.pending, (state) => {
      state.loadingUpdate = true;
      state.error = null;
    });
    builder.addCase(updateExpenseStatus.fulfilled, (state, action: PayloadAction<Expense>) => {
      state.loadingUpdate = false;
      const index = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    });
    builder.addCase(updateExpenseStatus.rejected, (state, action) => {
      state.loadingUpdate = false;
      state.error = action.payload as string;
    });

    // Fetch analytics
    builder.addCase(fetchAnalytics.pending, (state) => {
      state.loadingAnalytics = true;
      state.error = null;
    });
    builder.addCase(fetchAnalytics.fulfilled, (state, action: PayloadAction<Analytics>) => {
      state.loadingAnalytics = false;
      state.analytics = action.payload;
    });
    builder.addCase(fetchAnalytics.rejected, (state, action) => {
      state.loadingAnalytics = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, updateExpenseInList, addExpenseToList } = expenseSlice.actions;
export default expenseSlice.reducer;
