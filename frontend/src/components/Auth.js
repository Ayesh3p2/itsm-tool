import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
            }}
        >
            <Paper
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: isMobile ? '100%' : 400,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    ITSM Portal
                </Typography>
                <Typography variant="h6" gutterBottom align="center">
                    Welcome to ITSM Portal
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleLogin}
                    >
                        Login
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={handleRegister}
                    >
                        Register
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Auth;
