import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center items-center h-screen text-teal-600 text-lg">
      Loading...
    </div>
  );
  return user ? <Navigate to="/dashboard" /> : children;
};
export default PublicRoute;