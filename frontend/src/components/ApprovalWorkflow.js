import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { approveTicket, rejectTicket, getPendingApprovals } from '../services/approvalService';

const ApprovalWorkflow = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [approvalLevel, setApprovalLevel] = useState(1);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      const approvals = await getPendingApprovals();
      setPendingApprovals(approvals);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async () => {
    try {
      await approveTicket(selectedTicket._id, approvalLevel);
      setOpenDialog(false);
      setSelectedTicket(null);
      setApprovalLevel(1);
      loadPendingApprovals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async () => {
    try {
      await rejectTicket(selectedTicket._id, rejectionReason);
      setOpenDialog(false);
      setSelectedTicket(null);
      setRejectionReason('');
      loadPendingApprovals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenDialog = (ticket) => {
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Approval Workflow
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Current Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingApprovals.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell>{ticket._id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>{ticket.type}</TableCell>
                    <TableCell>{ticket.createdBy.name}</TableCell>
                    <TableCell>{ticket.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(ticket)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            Review Ticket #{selectedTicket?._id}
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              {selectedTicket?.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {selectedTicket?.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Approval Level:
              </Typography>
              <TextField
                select
                fullWidth
                value={approvalLevel}
                onChange={(e) => setApprovalLevel(Number(e.target.value))}
              >
                <option value={1}>Level 1 - Reporting Manager</option>
                <option value={2}>Level 2 - CTO</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApprove}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDialog(true)}
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ApprovalWorkflow;
