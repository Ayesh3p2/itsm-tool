import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const token = useSelector((state) => state.auth.token);

    // Check if we have a valid token
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
