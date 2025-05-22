import axios from 'axios';

const API_URL = '/api/tickets';

export const getPendingApprovals = async () => {
  try {
    const response = await axios.get(`${API_URL}/pending-approvals`, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    throw error;
  }
};

export const approveTicket = async (ticketId, approvalLevel) => {
  try {
    const response = await axios.patch(`${API_URL}/${ticketId}/approve`, {
      approvalLevel,
    }, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error approving ticket:', error);
    throw error;
  }
};

export const rejectTicket = async (ticketId, reason) => {
  try {
    const response = await axios.patch(`${API_URL}/${ticketId}/reject`, {
      reason,
    }, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting ticket:', error);
    throw error;
  }
};
