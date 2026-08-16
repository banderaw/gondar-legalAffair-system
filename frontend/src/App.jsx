import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';
import UserManagement from './pages/UserManagement';
import ReferenceDataManagement from './pages/ReferenceDataManagement';
import Documents from './pages/Documents';
import Hearings from './pages/Hearings';
import Agreements from './pages/Agreements';
import SubmitCase from './pages/SubmitCase';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cases" element={<CaseList />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<ReferenceDataManagement />} />
            <Route path="documents" element={<Documents />} />
            <Route path="hearings" element={<Hearings />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="submit-case" element={<SubmitCase />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
