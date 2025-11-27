import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Validate password
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Expense Tracker
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your expenses efficiently
            </Typography>
          </Box>

          {/* Form Section */}
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
              Welcome Back
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                placeholder="Enter your email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                error={!!emailError}
                helperText={emailError}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 1,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
