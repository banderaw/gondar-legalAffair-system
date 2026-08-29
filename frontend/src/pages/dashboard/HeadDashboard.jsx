import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getHeadDashboard, getLegalOfficers } from '../../api/dashboard';
import { assignCase } from '../../api/cases';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const HeadDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [legalOfficers, setLegalOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, officersData] = await Promise.all([
          getHeadDashboard(),
          getLegalOfficers()
        ]);
        setData(dashboardData);
        setLegalOfficers(officersData);
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

  const handleAssign = async (caseId, officerId) => {
    setAssigning(caseId);
    try {
      await assignCase(caseId, officerId);
      const updatedData = await getHeadDashboard();
      setData(updatedData);
      setSelectedOfficer({ ...selectedOfficer, [caseId]: '' });
    } catch (err) {
      setError('Failed to assign case');
    } finally {
      setAssigning(null);
    }
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

      {/* To Assign Panel - Primary Action */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-8 ring-2 ring-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📋</span> To Assign ({data.unassigned_cases.length})
        </h3>
        
        {data.unassigned_cases.length === 0 ? (
          <p className="text-sm text-gray-500">No unassigned cases</p>
        ) : (
          <div className="space-y-3">
            {data.unassigned_cases.map((caseItem) => (
              <div key={caseItem.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
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
                  <div className="flex items-center space-x-3 ml-4">
                    <select
                      value={selectedOfficer[caseItem.id] || ''}
                      onChange={(e) => setSelectedOfficer({ ...selectedOfficer, [caseItem.id]: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                      disabled={assigning === caseItem.id}
                    >
                      <option value="">Select officer...</option>
                      {legalOfficers.map((officer) => (
                        <option key={officer.id} value={officer.id}>
                          {officer.first_name} {officer.last_name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => handleAssign(caseItem.id, selectedOfficer[caseItem.id])}
                      disabled={!selectedOfficer[caseItem.id] || assigning === caseItem.id}
                      loading={assigning === caseItem.id}
                      size="sm"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Officer Workload Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚖️</span> Officer Workload
          </h3>
          <div className="space-y-4">
            {data.officer_workload.length === 0 ? (
              <p className="text-sm text-gray-500">No officers found</p>
            ) : (
              data.officer_workload
                .sort((a, b) => b.open_cases - a.open_cases)
                .map((officer) => (
                  <div key={officer.officer_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{officer.officer_name}</span>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">{officer.open_cases} open</span>
                        <span className="text-green-600">{officer.closed_this_month} closed this month</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full flex items-center justify-end pr-2 transition-all duration-300"
                          style={{ width: `${Math.min((officer.open_cases / 20) * 100, 100)}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{officer.open_cases}</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-green-500 h-full flex items-center justify-end pr-2 transition-all duration-300"
                          style={{ width: `${Math.min((officer.closed_this_month / 20) * 100, 100)}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{officer.closed_this_month}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Overdue Deadlines Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 ring-2 ring-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🚨</span> Overdue Deadlines ({data.overdue_deadlines.length})
          </h3>
          {data.overdue_deadlines.length === 0 ? (
            <p className="text-sm text-gray-500">No overdue deadlines</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.overdue_deadlines.map((deadline, index) => (
                <div
                  key={index}
                  onClick={() => handleCaseClick(deadline.case__id)}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{deadline.case__case_id}</p>
                    <Badge variant="danger">Overdue</Badge>
                  </div>
                  <p className="text-xs text-gray-700">{deadline.case__title}</p>
                  <p className="text-xs text-gray-600 mt-1">{deadline.description}</p>
                  <p className="text-xs text-red-600 font-medium mt-2">
                    Due: {new Date(deadline.due_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Hearings Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📅</span> Upcoming Hearings ({data.upcoming_hearings.length})
          </h3>
          {data.upcoming_hearings.length > 0 && (
            <button
              onClick={() => navigate('/hearings')}
              className="text-sm text-blue-900 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          )}
        </div>
        {data.upcoming_hearings.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming hearings</p>
        ) : (
          <div className="space-y-2">
            {data.upcoming_hearings.slice(0, 10).map((hearing, index) => (
              <div
                key={index}
                onClick={() => handleCaseClick(hearing.case__id)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{hearing.case__case_id}</p>
                    <p className="text-xs text-gray-700">{hearing.case__title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      {new Date(hearing.hearing_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{hearing.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cases Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
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

        {/* Priority Breakdown */}
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
      </div>
    </div>
  );
};

export default HeadDashboard;
