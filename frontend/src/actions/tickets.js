import api from '../config/axios';

export const FETCH_TICKETS = 'FETCH_TICKETS';
export const FETCH_TICKET = 'FETCH_TICKET';
export const CREATE_TICKET = 'CREATE_TICKET';
export const UPDATE_TICKET = 'UPDATE_TICKET';
export const DELETE_TICKET = 'DELETE_TICKET';
export const APPROVE_TICKET = 'APPROVE_TICKET';
export const REJECT_TICKET = 'REJECT_TICKET';

export const fetchTickets = () => async (dispatch) => {
    try {
        const response = await api.get('/tickets');
        dispatch({
            type: FETCH_TICKETS,
            payload: response.data,
        });
    } catch (error) {
        throw error;
    }
};

export const fetchTicket = (id) => async (dispatch) => {
    try {
        const response = await api.get(`/tickets/${id}`);
        dispatch({
            type: FETCH_TICKET,
            payload: response.data,
        });
    } catch (error) {
        throw error;
    }
};

export const createTicket = (ticketData) => async (dispatch) => {
    try {
        const response = await api.post('/tickets', ticketData);
        dispatch({
            type: CREATE_TICKET,
            payload: response.data,
        });
    } catch (error) {
        throw error;
    }
};

export const updateTicket = (id, ticketData) => async (dispatch) => {
    try {
        const response = await api.put(`/tickets/${id}`, ticketData);
        dispatch({
            type: UPDATE_TICKET,
            payload: response.data,
        });
    } catch (error) {
        throw error;
    }
};

export const deleteTicket = (id) => async (dispatch) => {
    try {
        await api.delete(`/tickets/${id}`);
        dispatch({
            type: DELETE_TICKET,
            payload: id,
        });
    } catch (error) {
        throw error;
    }
};
