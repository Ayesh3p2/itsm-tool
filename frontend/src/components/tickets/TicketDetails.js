import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTicket, updateTicket } from '../../actions/tickets';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TicketDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const ticket = useSelector((state) => state.tickets.ticket);
    const loading = useSelector((state) => state.tickets.loading);
    const error = useSelector((state) => state.tickets.error);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        priority: '',
    });

    useEffect(() => {
        dispatch(fetchTicket(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (ticket) {
            setFormData({
                title: ticket.title,
                description: ticket.description,
                type: ticket.type,
                priority: ticket.priority,
            });
        }
    }, [ticket]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({
            title: ticket.title,
            description: ticket.description,
            type: ticket.type,
            priority: ticket.priority,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateTicket(id, formData));
        handleClose();
    };

    const handleDelete = () => {
        // TODO: Implement delete ticket functionality
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            // dispatch(deleteTicket(id));
            navigate('/tickets');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>Loading ticket...</Typography>
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
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {ticket.title}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    {ticket.type}
                </Typography>
                <Chip
                    label={ticket.priority}
                    size="small"
                    color={ticket.priority === 'High' ? 'error' : 'default'}
                    sx={{ mb: 2 }}
                />
                <Typography variant="body1" paragraph>
                    {ticket.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpen}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </Box>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Ticket</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                            multiline
                            rows={4}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            margin="normal"
                            select
                            required
                        >
                            <option value="Hardware Request">Hardware Request</option>
                            <option value="Software Request">Software Request</option>
                            <option value="Accessories Request">Accessories Request</option>
                            <option value="Issue/Query">Issue/Query</option>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            margin="normal"
                            select
                            required
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketDetails;
