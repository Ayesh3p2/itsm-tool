import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Badge,
    Typography,
    Paper,
    Popover,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { markNotificationRead } from '../../actions/notifications';

const Notifications = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.notifications.notifications);
    const unreadCount = useSelector((state) => state.notifications.unreadCount);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkRead = (notificationId) => {
        dispatch(markNotificationRead(notificationId));
    };

    const open = Boolean(anchorEl);
    const id = open ? 'notifications-popover' : undefined;

    return (
        <Box>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Paper sx={{ width: 320 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        Notifications
                    </Typography>
                    <List>
                        {notifications.map((notification) => (
                            <ListItem
                                key={notification._id}
                                onClick={() => handleMarkRead(notification._id)}
                                sx={{
                                    cursor: 'pointer',
                                    backgroundColor: !notification.read ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        {notification.type.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={notification.title}
                                    secondary={notification.message}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Popover>
        </Box>
    );
};

export default Notifications;
