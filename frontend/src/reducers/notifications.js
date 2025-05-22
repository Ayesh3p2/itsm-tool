import {
    FETCH_NOTIFICATIONS,
    MARK_NOTIFICATION_READ,
    CLEAR_NOTIFICATIONS,
} from '../actions/notifications';

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCH_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.payload,
                unreadCount: action.payload.filter((n) => !n.read).length,
                loading: false,
                error: null,
            };
        case MARK_NOTIFICATION_READ:
            return {
                ...state,
                notifications: state.notifications.map((notification) =>
                    notification._id === action.payload
                        ? { ...notification, read: true }
                        : notification
                ),
                unreadCount: state.unreadCount - 1,
                loading: false,
                error: null,
            };
        case CLEAR_NOTIFICATIONS:
            return {
                ...state,
                notifications: [],
                unreadCount: 0,
                loading: false,
                error: null,
            };
        default:
            return state;
    }
}
