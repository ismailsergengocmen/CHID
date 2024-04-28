import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = ({ condition, redirectUrl }) => {
	return condition ? <Outlet /> : <Navigate to={redirectUrl} />;
};

export default PrivateRoutes;
