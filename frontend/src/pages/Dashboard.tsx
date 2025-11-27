import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Grid,
  Fab,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Logout } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { fetchExpenses, fetchAnalytics, updateExpenseInList, addExpenseToList } from '../store/slices/expenseSlice';
import { socketService } from '../services/socket';
import ExpenseList from '../components/ExpenseList';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AddExpenseDialog from '../components/AddExpenseDialog';
import { ExpenseCategory, ExpenseStatus, Role, Expense } from '../types';

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'info' | 'warning' } | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { expenses, analytics, loadingExpenses, loadingAnalytics } = useAppSelector((state) => state.expense);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (tabValue === 0) {
      dispatch(fetchExpenses({}));
    } else if (tabValue === 1) {
      dispatch(fetchAnalytics({}));
    } else if (tabValue === 2 && user.role === Role.ADMIN) {
      dispatch(fetchExpenses({ status: ExpenseStatus.PENDING }));
    }
  }, [user, navigate, dispatch, tabValue]);

  useEffect(() => {
    const params: any = {};
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchExpenses(params));
  }, [categoryFilter, statusFilter, dispatch]);

  useEffect(() => {
    const handleExpenseCreated = (expense: Expense) => {
      if (expense.userId !== user?.id) {
        setNotification({
          message: `New expense: ${expense.description}`,
          severity: 'info',
        });
        dispatch(addExpenseToList(expense));
      }
      
      if (tabValue === 1) {
        dispatch(fetchAnalytics({}));
      }
    };

    const handleExpenseUpdated = (expense: Expense) => {
      dispatch(updateExpenseInList(expense));
      if (expense.userId !== user?.id) {
        setNotification({
          message: `Updated: ${expense.description}`,
          severity: 'info',
        });
      }
      
      if (tabValue === 1) {
        dispatch(fetchAnalytics({}));
      }
    };

    const handleExpenseStatusChanged = (expense: Expense) => {
      const statusText = expense.status === ExpenseStatus.APPROVED ? 'Approved' : expense.status === ExpenseStatus.REJECTED ? 'Rejected' : expense.status;
      setNotification({
        message: `Expense ${statusText}: ${expense.description}`,
        severity: expense.status === ExpenseStatus.APPROVED ? 'success' : 'warning',
      });
      dispatch(updateExpenseInList(expense));
      
      if (tabValue === 1) {
        dispatch(fetchAnalytics({}));
      }
    };

    socketService.on('expense:created', handleExpenseCreated);
    socketService.on('expense:updated', handleExpenseUpdated);
    socketService.on('expense:statusChanged', handleExpenseStatusChanged);

    return () => {
      socketService.off('expense:created', handleExpenseCreated);
      socketService.off('expense:updated', handleExpenseUpdated);
      socketService.off('expense:statusChanged', handleExpenseStatusChanged);
    };
  }, [dispatch, user?.id, tabValue]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    dispatch(fetchExpenses({}));
    dispatch(fetchAnalytics({}));
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={1}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h5" component="div" fontWeight="bold">
              Expense Tracker
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" fontWeight="600">
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {user?.role}
              </Typography>
            </Box>
            <Button 
              color="inherit" 
              onClick={handleLogout} 
              startIcon={<Logout />}
              sx={{
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box 
          sx={{ 
            borderBottom: 2, 
            borderColor: 'primary.main', 
            mb: 4,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: '8px 8px 0 0',
            backgroundColor: 'white',
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
              },
            }}
          >
            <Tab label="Expenses" />
            <Tab label="Analytics" />
            {user?.role === Role.ADMIN && <Tab label="Approval Queue" />}
          </Tabs>
        </Box>

        {/* Expenses Tab */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Object.values(ExpenseCategory).map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.split('_').join(' ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(ExpenseStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <ExpenseList expenses={expenses} loading={loadingExpenses} />
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <Box>
            <AnalyticsDashboard analytics={analytics} loading={loadingAnalytics} />
          </Box>
        )}

        {/* Approval Queue Tab (Admin only) */}
        {tabValue === 2 && user?.role === Role.ADMIN && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pending Approvals
            </Typography>
            <ExpenseList
              expenses={expenses.filter((e) => e.status === ExpenseStatus.PENDING)}
              loading={loadingExpenses}
            />
          </Box>
        )}
      </Container>

      {/* Add Expense FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          width: 64,
          height: 64,
        }}
        onClick={() => setDialogOpen(true)}
      >
        <Add sx={{ fontSize: 32 }} />
      </Fab>

      <AddExpenseDialog open={dialogOpen} onClose={handleDialogClose} />

      {/* Real-time notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard;
