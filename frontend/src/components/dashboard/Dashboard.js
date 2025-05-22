import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Tooltip,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import FilterListIcon from '@mui/icons-material/FilterList';
import DashboardStats from './DashboardStats';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTickets: 0,
        pendingTickets: 0,
        approvedTickets: 0,
        rejectedTickets: 0,
        averageApprovalTime: 0,
        approvalStats: [],
    });
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [filters, setFilters] = useState({
        priority: '',
        type: '',
        status: '',
    });
    const [sortConfig, setSortConfig] = useState({
        key: '',
        direction: 'asc',
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, approvalsResponse] = await Promise.all([
                fetch('/api/stats/approvals'),
                fetch('/api/approvals/pending')
            ]);

            const statsData = await statsResponse.json();
            const approvalsData = await approvalsResponse.json();

            setStats(statsData);
            setPendingApprovals(approvalsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleApprovalClick = (ticketId) => {
        navigate(`/tickets/${ticketId}/approve`);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredPendingApprovals = pendingApprovals.filter((approval) => {
        const matchesPriority = !filters.priority || approval.priority === filters.priority;
        const matchesType = !filters.type || approval.type === filters.type;
        const matchesStatus = !filters.status || approval.status === filters.status;
        return matchesPriority && matchesType && matchesStatus;
    });

    const sortedPendingApprovals = [...filteredPendingApprovals].sort((a, b) => {
        if (sortConfig.key === 'priority') {
            return sortConfig.direction === 'asc'
                ? a.priority.localeCompare(b.priority)
                : b.priority.localeCompare(a.priority);
        }
        if (sortConfig.key === 'type') {
            return sortConfig.direction === 'asc'
                ? a.type.localeCompare(b.type)
                : b.type.localeCompare(a.type);
        }
        return 0;
    });

    const renderFilters = () => (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Filters
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            name="priority"
                            value={filters.priority}
                            onChange={handleFilterChange}
                            label="Priority"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Urgent">Urgent</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            label="Type"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Hardware Request">Hardware Request</MenuItem>
                            <MenuItem value="Software Request">Software Request</MenuItem>
                            <MenuItem value="Accessories Request">Accessories Request</MenuItem>
                            <MenuItem value="Issue/Query">Issue/Query</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Level1 Approved">Level1 Approved</MenuItem>
                            <MenuItem value="Level2 Approved">Level2 Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );

    const renderStatsCard = (title, value, color) => (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="div" color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    const renderApprovalChart = () => (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Approval Time Distribution
            </Typography>
            <BarChart width={600} height={300} data={stats.approvalStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageTime" fill="#8884d8" />
                <Bar dataKey="minTime" fill="#82ca9d" />
                <Bar dataKey="maxTime" fill="#ffc658" />
            </BarChart>
        </Paper>
    );

    const renderPendingApprovals = () => (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Pending Approvals
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'priority'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('priority')}
                                >
                                    Priority
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'type'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('type')}
                                >
                                    Type
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPendingApprovals.map((approval) => (
                            <TableRow key={approval._id}>
                                <TableCell>
                                    <Chip
                                        label={approval.priority}
                                        size="small"
                                        color={approval.priority === 'High' ? 'error' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>{approval.type}</TableCell>
                                <TableCell>{approval.title}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleApprovalClick(approval._id)}
                                    >
                                        Approve
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    {renderStatsCard('Total Tickets', stats.totalTickets, '#1976d2')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderStatsCard('Pending Tickets', stats.pendingTickets, '#f44336')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderStatsCard('Approved Tickets', stats.approvedTickets, '#4caf50')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderStatsCard('Rejected Tickets', stats.rejectedTickets, '#ff9800')}
                </Grid>
                <Grid item xs={12}>
                    {renderFilters()}
                </Grid>
                <Grid item xs={12}>
                    <DashboardStats stats={stats} loading={loading} />
                </Grid>
                <Grid item xs={12}>
                    {renderPendingApprovals()}
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
