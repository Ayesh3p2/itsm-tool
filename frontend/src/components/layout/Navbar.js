import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logout, USER_LOGOUT } from '../../actions/auth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Clear token from localStorage
        localStorage.removeItem('token');
        dispatch(logout());
        handleClose();
        // Redirect to login after a short delay
        setTimeout(() => {
            navigate('/login');
        }, 100);
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <img src={process.env.PUBLIC_URL + '/logo.svg'} alt="ServNow Logo" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                    <Typography variant="h6">
                        ServNow
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button component={Link} to="/dashboard" color="inherit" sx={{ textTransform: 'none' }}>
                        Dashboard
                    </Button>
                    <Button component={Link} to="/tickets" color="inherit" sx={{ textTransform: 'none' }}>
                        Tickets
                    </Button>
                    <Button component={Link} to="/profile" color="inherit" sx={{ textTransform: 'none' }}>
                        Profile
                    </Button>
                    <IconButton color="inherit" size="small">
                        <Badge badgeContent={0} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Box>

            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
