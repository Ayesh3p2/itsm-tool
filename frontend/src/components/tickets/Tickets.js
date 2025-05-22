import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTickets } from '../../actions/tickets';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Tickets = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const tickets = useSelector((state) => state.tickets.tickets);
    const loading = useSelector((state) => state.tickets.loading);
    const error = useSelector((state) => state.tickets.error);

    useEffect(() => {
        dispatch(fetchTickets());
    }, [dispatch]);

    const handleEdit = (id) => {
        navigate(`/tickets/${id}`);
    };

    const handleDelete = (id) => {
        // TODO: Implement delete ticket functionality
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            // dispatch(deleteTicket(id));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>Loading tickets...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Tickets
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/tickets/new')}
                sx={{ mb: 2 }}
            >
                Create New Ticket
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map((ticket) => (
                            <TableRow key={ticket._id}>
                                <TableCell>{ticket.title}</TableCell>
                                <TableCell>{ticket.type}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={ticket.priority}
                                        size="small"
                                        color={ticket.priority === 'High' ? 'error' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>{ticket.status}</TableCell>
                                <TableCell>
                                    <Tooltip title="Edit">
                                        <IconButton onClick={() => handleEdit(ticket._id)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            onClick={() => handleDelete(ticket._id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Tickets;
