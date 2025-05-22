import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Container,
    CircularProgress,
    Alert
} from '@mui/material';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, loginRequest } from '../../actions/auth';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            console.log('API URL:', process.env.REACT_APP_API_URL);
            
            // Verify API URL exists
            if (!process.env.REACT_APP_API_URL) {
                throw new Error('API URL is not configured');
            }

            // First, verify the token with Google
            const googleResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            if (!googleResponse.ok) {
                const errorData = await googleResponse.json();
                throw new Error(errorData.error || `Google auth failed: ${googleResponse.status}`);
            }

            const googleData = await googleResponse.json();
            console.log('Google auth response:', googleData);

            // Set token and navigate
            localStorage.setItem('token', googleData.token);
            navigate('/dashboard', { replace: true }); // Use replace to prevent going back to login
        } catch (error) {
            console.error('Google login error:', error);
            setError(error.message || 'Google login failed');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
                        Sign in
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                            Or login with
                        </Typography>
                        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => setError('Google login failed')}
                                useOneTap
                                size="large"
                                theme="filled_black"
                                shape="rectangular"
                            />
                        </GoogleOAuthProvider>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
