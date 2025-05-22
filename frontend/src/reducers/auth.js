import { USER_LOGIN, USER_LOGOUT } from '../actions/auth';

const initialState = {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case USER_LOGIN:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                token: action.payload.token,
                loading: false,
                error: null,
            };
        case USER_LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                token: null,
                loading: false,
                error: null,
            };
        default:
            return state;
    }
}
