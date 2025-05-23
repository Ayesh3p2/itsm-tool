import {
    FETCH_TICKETS,
    FETCH_TICKET,
    CREATE_TICKET,
    UPDATE_TICKET,
    DELETE_TICKET,
    APPROVE_TICKET,
    REJECT_TICKET,
} from '../actions/tickets';

const initialState = {
    tickets: [],
    ticket: null,
    loading: false,
    error: null,
};

const ticketsReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_TICKETS:
            return {
                ...state,
                tickets: action.payload,
                loading: false,
            };
        case FETCH_TICKET:
            return {
                ...state,
                ticket: action.payload,
                loading: false,
            };
        case CREATE_TICKET:
            return {
                ...state,
                tickets: [...state.tickets, action.payload],
                loading: false,
            };
        case UPDATE_TICKET:
            return {
                ...state,
                tickets: state.tickets.map(ticket =>
                    ticket._id === action.payload._id ? action.payload : ticket
                ),
                loading: false,
            };
        case DELETE_TICKET:
            return {
                ...state,
                tickets: state.tickets.filter(ticket => ticket._id !== action.payload),
                loading: false,
            };
        case APPROVE_TICKET:
        case REJECT_TICKET:
            return {
                ...state,
                tickets: state.tickets.map(ticket =>
                    ticket._id === action.payload._id ? action.payload : ticket
                ),
                loading: false,
            };
        default:
            return state;
    }
};

export { ticketsReducer };
    switch (action.type) {
        case FETCH_TICKETS:
            return {
                ...state,
                tickets: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_TICKET:
            return {
                ...state,
                ticket: action.payload,
                loading: false,
                error: null,
            };
        case CREATE_TICKET:
            return {
                ...state,
                tickets: [...state.tickets, action.payload],
                loading: false,
                error: null,
            };
        case UPDATE_TICKET:
            return {
                ...state,
                tickets: state.tickets.map((ticket) =>
                    ticket._id === action.payload._id ? action.payload : ticket
                ),
                loading: false,
                error: null,
            };
        case DELETE_TICKET:
            return {
                ...state,
                tickets: state.tickets.filter((ticket) => ticket._id !== action.payload),
                loading: false,
                error: null,
            };
        case APPROVE_TICKET:
        case REJECT_TICKET:
            return {
                ...state,
                tickets: state.tickets.map((ticket) =>
                    ticket._id === action.payload._id ? { ...ticket, status: action.type === APPROVE_TICKET ? 'Approved' : 'Rejected' } : ticket
                ),
                loading: false,
                error: null,
            };
        default:
            return state;
    }
}
