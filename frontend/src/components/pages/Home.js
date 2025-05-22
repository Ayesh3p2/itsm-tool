import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Welcome to ITSM Portal
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Overview
                </Typography>
                <Typography>
                    This is your central hub for managing IT Service Management tickets.
                    You can view and manage all your tickets, including:
                </Typography>
                <ul>
                    <li>Hardware Requests</li>
                    <li>Software Requests</li>
                    <li>Accessories Requests</li>
                    <li>Issues and Queries</li>
                </ul>
            </Paper>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 3 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 3 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            onClick={() => navigate('/tickets/new')}
                        >
                            Create New Ticket
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Home;
