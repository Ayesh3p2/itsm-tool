import axios from 'axios';

export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const MARK_NOTIFICATION_READ = 'MARK_NOTIFICATION_READ';
export const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';

export const fetchNotifications = () => async (dispatch) => {
    try {
        const response = await axios.get('/api/notifications');
        dispatch({
            type: FETCH_NOTIFICATIONS,
            payload: response.data,
        });
    } catch (error) {
        throw error;
    }
};

export const markNotificationRead = (notificationId) => async (dispatch) => {
    try {
        await axios.patch(`/api/notifications/${notificationId}/read`);
        dispatch({
            type: MARK_NOTIFICATION_READ,
            payload: notificationId,
        });
    } catch (error) {
        throw error;
    }
};

export const clearNotifications = () => ({
    type: CLEAR_NOTIFICATIONS,
});
