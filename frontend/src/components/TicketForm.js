import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';
import api from '../config/api';

const TicketForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Hardware Request',
    priority: 'Medium',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      if (!token) {
        alert('Not authenticated. Please log in first.');
        return;
      }

      console.log('Submitting ticket:', formData);
      const response = await api.post('/tickets', formData);
      console.log('Response:', response.data);
      
      alert('Ticket created successfully!');
      setFormData({
        title: '',
        description: '',
        type: 'Hardware Request',
        priority: 'Medium',
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show more specific error message
      if (error.response?.data?.msg) {
        alert(error.response.data.msg);
      } else if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (error.response?.status === 400) {
        alert('Invalid form data. Please check your inputs.');
      } else if (error.response?.status === 500) {
        alert('Server error occurred. Please try again later.');
      } else {
        alert('Failed to create ticket. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Ticket
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ticket Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Ticket Type"
                >
                  <MenuItem value="Hardware Request">Hardware Request</MenuItem>
                  <MenuItem value="Software Request">Software Request</MenuItem>
                  <MenuItem value="Accessories Request">Accessories Request</MenuItem>
                  <MenuItem value="Issue/Query">Issue/Query</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Submit Ticket
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TicketForm;
