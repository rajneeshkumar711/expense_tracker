import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import { socketService } from './services/socket';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (token) {
      console.log('Initializing socket connection...');
      socketService.connect(token);
    } else {
      // Disconnect socket when user logs out
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
