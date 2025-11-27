import expenseReducer, { ExpenseState } from '../store/slices/expenseSlice';
import { Expense } from '../types';

describe('expenseSlice', () => {
  const initialState: ExpenseState = {
    expenses: [],
    analytics: null,
    loadingExpenses: false,
    loadingAnalytics: false,
    loadingCreate: false,
    loadingUpdate: false,
    error: null,
  };

  const mockExpense: Expense = {
    id: '1',
    amount: 100,
    category: 'FOOD' as any,
    description: 'Test expense',
    date: new Date().toISOString(),
    status: 'PENDING' as any,
    userId: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  it('should return the initial state', () => {
    expect(expenseReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle fetchExpenses.pending', () => {
    const action = { type: 'expense/fetchAll/pending' };
    const state = expenseReducer(initialState, action);

    expect(state.loadingExpenses).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle fetchExpenses.fulfilled', () => {
    const action = {
      type: 'expense/fetchAll/fulfilled',
      payload: [mockExpense],
    };

    const state = expenseReducer(initialState, action);

    expect(state.loadingExpenses).toBe(false);
    expect(state.expenses).toEqual([mockExpense]);
    expect(state.error).toBe(null);
  });

  it('should handle fetchExpenses.rejected', () => {
    const action = {
      type: 'expense/fetchAll/rejected',
      payload: 'Failed to fetch expenses',
    };

    const state = expenseReducer(initialState, action);

    expect(state.loadingExpenses).toBe(false);
    expect(state.error).toBe('Failed to fetch expenses');
  });

  it('should handle createExpense.fulfilled', () => {
    const action = {
      type: 'expense/create/fulfilled',
      payload: mockExpense,
    };

    const state = expenseReducer(initialState, action);

    expect(state.loadingCreate).toBe(false);
    expect(state.expenses).toContainEqual(mockExpense);
  });

  it('should handle updateExpenseStatus.fulfilled', () => {
    const previousState: ExpenseState = {
      ...initialState,
      expenses: [mockExpense],
    };

    const updatedExpense = {
      ...mockExpense,
      status: 'APPROVED' as any,
    };

    const action = {
      type: 'expense/updateStatus/fulfilled',
      payload: updatedExpense,
    };

    const state = expenseReducer(previousState, action);

    expect(state.expenses[0].status).toBe('APPROVED');
  });

  it('should handle fetchAnalytics.fulfilled', () => {
    const analytics = {
      total: 1000,
      count: 10,
      pendingCount: 3,
      byCategory: [],
      byStatus: [],
    };

    const action = {
      type: 'expense/fetchAnalytics/fulfilled',
      payload: analytics,
    };

    const state = expenseReducer(initialState, action);

    expect(state.analytics).toEqual(analytics);
    expect(state.loadingAnalytics).toBe(false);
  });
});
