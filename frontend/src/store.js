import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/auth';
import ticketsReducer from './reducers/tickets';
import notificationsReducer from './reducers/notifications';

export default configureStore({
    reducer: {
        auth: authReducer,
        tickets: ticketsReducer,
        notifications: notificationsReducer,
    },
});
