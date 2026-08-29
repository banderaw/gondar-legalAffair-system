import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminDashboard } from '../../api/dashboard';
import Badge from '../../components/Badge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminDashboard();
        setData(response);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCaseClick = (caseId) => {
    navigate(`/dashboard/cases/${caseId}`);
  };

  const PRIORITY_COLORS = {
    urgent: 'danger',
    high: 'warning',
    normal: 'info',
    low: 'default',
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Pending Review Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6 mb-8 ring-2 ring-amber-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⏳</span> Pending Review ({data.pending_review_cases?.length || 0})
        </h3>
        
        {data.pending_review_cases?.length === 0 ? (
          <p className="text-sm text-gray-500">No cases pending review</p>
        ) : (
          <div className="space-y-3">
            {data.pending_review_cases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => handleCaseClick(caseItem.id)}
                className="p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-semibold text-blue-900">{caseItem.case_id}</p>
                      <Badge variant={PRIORITY_COLORS[caseItem.priority]}>{caseItem.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{caseItem.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {caseItem.category__name} • {caseItem.campus__name}
                    </p>
                  </div>
                  <span className="text-blue-900 text-sm font-medium">Review →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.total_cases}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.total_users}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 ring-2 ring-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Unassigned Urgent</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{data.unassigned_urgent_count}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6 ring-2 ring-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Stale Cases</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">{data.stale_cases_count}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 mb-8 ring-2 ring-red-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🚨</span> Needs Attention
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-3">Unassigned Urgent Cases ({data.unassigned_urgent_count})</h4>
            {data.unassigned_urgent.length === 0 ? (
              <p className="text-sm text-gray-500">No unassigned urgent cases</p>
            ) : (
              <div className="space-y-2">
                {data.unassigned_urgent.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => handleCaseClick(caseItem.id)}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{caseItem.case_id}</p>
                        <p className="text-xs text-gray-600">{caseItem.title}</p>
                      </div>
                      <Badge variant="danger">Urgent</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-yellow-700 mb-3">Stale Cases ({data.stale_cases_count})</h4>
            {data.stale_cases.length === 0 ? (
              <p className="text-sm text-gray-500">No stale cases</p>
            ) : (
              <div className="space-y-2">
                {data.stale_cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => handleCaseClick(caseItem.id)}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{caseItem.case_id}</p>
                        <p className="text-xs text-gray-600">{caseItem.title}</p>
                      </div>
                      <Badge variant="warning">Stale</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚖️</span> Officer Workload
        </h3>
        <div className="space-y-4">
          {data.officer_workload.length === 0 ? (
            <p className="text-sm text-gray-500">No officers found</p>
          ) : (
            data.officer_workload.map((officer) => (
              <div key={officer.officer_id} className="flex items-center space-x-4">
                <div className="w-48 text-sm font-medium text-gray-700">
                  {officer.officer_name}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ width: `${Math.min((officer.open_cases / 20) * 100, 100)}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{officer.open_cases}</span>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-600 text-right">
                  {officer.open_cases} cases
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Status</h3>
          <div className="space-y-3">
            {Object.entries(data.status_counts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Priority</h3>
          <div className="space-y-3">
            {Object.entries(data.priority_counts).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{priority}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Campus</h3>
          <div className="space-y-3">
            {Object.entries(data.campus_counts).map(([campus, count]) => (
              <div key={campus} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{campus}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📋</span> System Activity
        </h3>
        <div className="space-y-3">
          {data.recent_activity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            data.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.case__case_id} - {activity.case__title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user__first_name} {activity.user__last_name} (@{activity.user__username})
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Summary</h3>
            <div className="flex space-x-6">
              <div>
                <p className="text-sm text-gray-600">Admin</p>
                <p className="text-lg font-bold text-gray-900">{data.users_by_role.admin || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Head</p>
                <p className="text-lg font-bold text-gray-900">{data.users_by_role.head || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Legal Officer</p>
                <p className="text-lg font-bold text-gray-900">{data.users_by_role.legal_officer || 0}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/users')}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            Manage Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
