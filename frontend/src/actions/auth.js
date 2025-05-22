import api from '../config/axios';

export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGOUT = 'USER_LOGOUT';

export const login = (user) => ({
    type: USER_LOGIN,
    payload: user,
});

export const logout = () => ({
    type: USER_LOGOUT,
});

export const loginRequest = (email, password) => async (dispatch) => {
    try {
        console.log('Logging in with email:', email);
        const response = await api.post('/auth/login', { email, password });
        console.log('Login response:', response.data);
        dispatch(login(response.data.user));
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

export const registerRequest = (userData) => async (dispatch) => {
    try {
        console.log('Registering user with data:', userData);
        const response = await api.post('/auth/register', userData);
        console.log('Registration response:', response.data);
        dispatch(login(response.data.user));
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};
