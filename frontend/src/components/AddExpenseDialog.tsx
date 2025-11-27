import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createExpense } from '../store/slices/expenseSlice';
import { ExpenseCategory } from '../types';

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const categories = [
  { value: ExpenseCategory.TRAVEL, label: 'Travel' },
  { value: ExpenseCategory.FOOD, label: 'Food' },
  { value: ExpenseCategory.OFFICE_SUPPLIES, label: 'Office Supplies' },
  { value: ExpenseCategory.EQUIPMENT, label: 'Equipment' },
  { value: ExpenseCategory.SOFTWARE, label: 'Software' },
  { value: ExpenseCategory.TRAINING, label: 'Training' },
  { value: ExpenseCategory.ENTERTAINMENT, label: 'Entertainment' },
  { value: ExpenseCategory.OTHER, label: 'Other' },
];

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({ open, onClose }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OTHER);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [localError, setLocalError] = useState('');

  const dispatch = useAppDispatch();
  const { loadingCreate } = useAppSelector((state) => state.expense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setLocalError('Please enter a valid amount');
      return;
    }

    const result = await dispatch(
      createExpense({
        amount: amountNum,
        category,
        description,
        date,
      })
    );

    if (createExpense.fulfilled.match(result)) {
      setAmount('');
      setCategory(ExpenseCategory.OTHER);
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      onClose();
    } else {
      setLocalError('Failed to create expense');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.5rem',
        }}
      >
        Add New Expense
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ step: '0.01', min: '0.01' }}
          />

          <TextField
            margin="dense"
            label="Category"
            select
            fullWidth
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            required
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={onClose} 
            disabled={loadingCreate}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loadingCreate}
            sx={{
              borderRadius: 1,
              px: 3,
            }}
          >
            {loadingCreate ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddExpenseDialog;
