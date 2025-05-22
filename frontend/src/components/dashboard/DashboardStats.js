import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardStats = ({ stats, loading }) => {
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getTicketTypeStats = () => {
        const typeStats = {};
        stats.approvalStats.forEach((stat) => {
            typeStats[stat.type] = typeStats[stat.type] || {
                count: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0,
            };
            typeStats[stat.type].count++;
            typeStats[stat.type].avgTime += stat.averageTime;
            typeStats[stat.type].minTime = Math.min(
                typeStats[stat.type].minTime,
                stat.minTime
            );
            typeStats[stat.type].maxTime = Math.max(
                typeStats[stat.type].maxTime,
                stat.maxTime
            );
        });

        return Object.entries(typeStats).map(([type, data]) => ({
            type,
            count: data.count,
            avgTime: data.avgTime / data.count,
            minTime: data.minTime,
            maxTime: data.maxTime,
        }));
    };

    const getPriorityStats = () => {
        const priorityStats = {
            Low: 0,
            Medium: 0,
            High: 0,
            Urgent: 0,
        };
        stats.approvalStats.forEach((stat) => {
            priorityStats[stat.priority]++;
        });
        return priorityStats;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab label="Ticket Types" />
                        <Tab label="Priority Distribution" />
                        <Tab label="Approval Times" />
                    </Tabs>
                </Paper>
            </Grid>

            {tabValue === 0 && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Ticket Type Distribution
                            </Typography>
                            <PieChart width={800} height={400}>
                                <Pie
                                    data={getTicketTypeStats()}
                                    dataKey="count"
                                    nameKey="type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    fill="#8884d8"
                                >
                                    {getTicketTypeStats().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </CardContent>
                    </Card>
                </Grid>
            )}

            {tabValue === 1 && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Priority Distribution
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Priority</TableCell>
                                            <TableCell align="right">Count</TableCell>
                                            <TableCell align="right">Percentage</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(getPriorityStats()).map(([priority, count]) => (
                                            <TableRow key={priority}>
                                                <TableCell>{priority}</TableCell>
                                                <TableCell align="right">{count}</TableCell>
                                                <TableCell align="right">
                                                    {((count / stats.totalTickets) * 100).toFixed(1)}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            )}

            {tabValue === 2 && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Approval Times by Priority
                            </Typography>
                            <BarChart width={800} height={400} data={stats.approvalStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="priority" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="averageTime" fill="#8884d8" />
                                <Bar dataKey="minTime" fill="#82ca9d" />
                                <Bar dataKey="maxTime" fill="#ffc658" />
                            </BarChart>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
};

export default DashboardStats;
