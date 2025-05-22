import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const MonitoringDashboard = () => {
    const [metrics, setMetrics] = useState({
        dbQueries: [],
        rateLimit: [],
        cors: [],
        xss: [],
        csrf: [],
        backup: []
    });

    useEffect(() => {
        // Fetch metrics from backend
        const fetchMetrics = async () => {
            try {
                const response = await axios.get('/api/metrics');
                setMetrics(response.data);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        // Initial fetch
        fetchMetrics();

        // Poll every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);

        // Cleanup
        return () => clearInterval(interval);
    }, []);

    // Helper function to format timestamp
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Grid container spacing={3}>
            {/* Database Queries Chart */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '400px' }}>
                    <Typography variant="h6" gutterBottom>
                        Database Queries
                    </Typography>
                    <LineChart
                        width={600}
                        height={300}
                        data={metrics.dbQueries}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="success"
                            stroke="#8884d8"
                            name="Success"
                        />
                        <Line
                            type="monotone"
                            dataKey="error"
                            stroke="#82ca9d"
                            name="Error"
                        />
                    </LineChart>
                </Paper>
            </Grid>

            {/* Security Metrics Chart */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '400px' }}>
                    <Typography variant="h6" gutterBottom>
                        Security Metrics
                    </Typography>
                    <LineChart
                        width={600}
                        height={300}
                        data={metrics.rateLimit}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="rateLimit"
                            stroke="#8884d8"
                            name="Rate Limit"
                        />
                        <Line
                            type="monotone"
                            dataKey="cors"
                            stroke="#82ca9d"
                            name="CORS"
                        />
                        <Line
                            type="monotone"
                            dataKey="xss"
                            stroke="#ffc658"
                            name="XSS"
                        />
                        <Line
                            type="monotone"
                            dataKey="csrf"
                            stroke="#ff7300"
                            name="CSRF"
                        />
                    </LineChart>
                </Paper>
            </Grid>

            {/* Backup Status */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Backup Status
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                            Last Backup: {formatTimestamp(metrics.backup[0]?.timestamp || 'Never')}
                        </Typography>
                        <Typography variant="body1" color={metrics.backup[0]?.success ? 'success.main' : 'error.main'}>
                            Status: {metrics.backup[0]?.success ? 'Success' : 'Failed'}
                        </Typography>
                    </Box>
                </Paper>
            </Grid>

            {/* Recent Events */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Recent Events
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {metrics.backup.map((event, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1,
                                    borderBottom: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography variant="body1">
                                    {formatTimestamp(event.timestamp)}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color={event.success ? 'success.main' : 'error.main'}
                                >
                                    {event.success ? 'Success' : 'Failed'}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default MonitoringDashboard;
