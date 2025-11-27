import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { format } from 'date-fns';
import { Expense, ExpenseStatus, Role } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateExpenseStatus } from '../store/slices/expenseSlice';

interface ExpenseListProps {
  expenses: Expense[];
  loading?: boolean;
}

const getStatusColor = (status: ExpenseStatus) => {
  switch (status) {
    case ExpenseStatus.APPROVED:
      return 'success';
    case ExpenseStatus.REJECTED:
      return 'error';
    case ExpenseStatus.PENDING:
      return 'warning';
    default:
      return 'default';
  }
};

const formatCategory = (category: string) => {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, loading = false }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, expense: Expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleStatusUpdate = async (status: ExpenseStatus) => {
    if (selectedExpense) {
      await dispatch(updateExpenseStatus({ id: selectedExpense.id, status }));
      handleMenuClose();
    }
  };

  const canUpdateStatus = (expense: Expense) => {
    return user?.role === Role.ADMIN && expense.status === ExpenseStatus.PENDING;
  };

  if (loading) {
    return (
      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'grey.100',
              }}
            >
              <TableCell><Skeleton width={80} /></TableCell>
              <TableCell><Skeleton width={120} /></TableCell>
              <TableCell><Skeleton width={100} /></TableCell>
              <TableCell><Skeleton width={80} /></TableCell>
              {user?.role === Role.ADMIN && <TableCell><Skeleton width={100} /></TableCell>}
              <TableCell><Skeleton width={80} /></TableCell>
              <TableCell align="right"><Skeleton width={60} /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                {user?.role === Role.ADMIN && <TableCell><Skeleton /></TableCell>}
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={40} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (expenses.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: 'grey.50',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" color="textSecondary" gutterBottom>
          📭 No expenses found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Click the + button to add your first expense
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'grey.100',
                '& .MuiTableCell-head': {
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'text.primary',
                },
              }}
            >
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              {user?.role === Role.ADMIN && <TableCell>Employee</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow 
                key={expense.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{formatCategory(expense.category)}</TableCell>
                <TableCell>${expense.amount.toFixed(2)}</TableCell>
                {user?.role === Role.ADMIN && <TableCell>{expense.user.name}</TableCell>}
                <TableCell>
                  <Chip
                    label={expense.status}
                    color={getStatusColor(expense.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {canUpdateStatus(expense) && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, expense)}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate(ExpenseStatus.APPROVED)}>
          Approve
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(ExpenseStatus.REJECTED)}>
          Reject
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExpenseList;
