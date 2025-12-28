import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// 1. Basic Protection (Any logged in user)
export const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>; 
    return user ? <Outlet /> : <Navigate to="/login" />;
};

// 2. Admin Protection (Only Warden)
// THE ERROR HAPPENED BECAUSE THIS PART WAS MISSING OR NOT EXPORTED
export const AdminRoute = () => {
    const { user, loading } = useContext(AuthContext);
    
    // Debug: Log user info
    if (user) {
        console.log('AdminRoute Check:', { 
            userRole: user.role, 
            isAdmin: user.role === 'admin',
            fullUser: user 
        });
    }
    
    if (loading) return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>;

    // Require admin role
    if (user && user.role === 'admin') {
        return <Outlet />;
    }
    
    console.log('AdminRoute: User is not admin, redirecting to public dashboard');
    return <Navigate to="/user/dashboard" />;
};