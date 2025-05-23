import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Tickets from './components/tickets/Tickets';
import TicketForm from './components/TicketForm';
import TicketDetails from './components/tickets/TicketDetails';
import Dashboard from './components/dashboard/Dashboard';
import { Provider } from 'react-redux';
import store from './store';
import TipsAndTricks from './components/TipsAndTricks';
import useSecurity from './hooks/useSecurity';

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

const App = () => {
  useSecurity(); // Initialize security features

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/new-ticket" element={<PrivateRoute><TicketForm /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
          <Route path="/tickets/new" element={<PrivateRoute><TicketForm /></PrivateRoute>} />
          <Route path="/tickets/:id" element={<PrivateRoute><TicketForm /></PrivateRoute>} />
        </Routes>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
