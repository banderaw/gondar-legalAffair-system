import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import HeadDashboard from './dashboard/HeadDashboard';
import OfficerDashboard from './dashboard/OfficerDashboard';
import ReporterDashboard from './dashboard/ReporterDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'head':
      return <HeadDashboard />;
    case 'legal_officer':
      return <OfficerDashboard />;
    case 'reporter':
      return <ReporterDashboard />;
    default:
      return <div>Unknown role</div>;
  }
};

export default Dashboard;
