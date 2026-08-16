import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOfficerDashboard } from '../../api/dashboard';
import Badge from '../../components/Badge';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getOfficerDashboard();
      setData(response);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDaysSince = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffTime = now - created;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAttentionItems = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59);

    const items = [];
    
    // Overdue deadlines
    data.my_deadlines.forEach(deadline => {
      if (new Date(deadline.due_date) < now) {
        items.push({
          type: 'deadline',
          urgency: 'overdue',
          case_id: deadline.case__id,
          case_title: deadline.case__title,
          description: deadline.description,
          due_date: deadline.due_date
        });
      }
    });

    // Hearings today or tomorrow
    data.my_upcoming_hearings.forEach(hearing => {
      const hearingDate = new Date(hearing.hearing_date);
      if (hearingDate <= tomorrow) {
        items.push({
          type: 'hearing',
          urgency: hearingDate < now ? 'overdue' : 'today',
          case_id: hearing.case__id,
          case_title: hearing.case__title,
          description: `Hearing at ${hearing.location}`,
          due_date: hearing.hearing_date
        });
      }
    });

    // Urgent cases
    data.my_urgent_cases.forEach(caseItem => {
      items.push({
        type: 'case',
        urgency: caseItem.priority === 'urgent' ? 'urgent' : 'high',
        case_id: caseItem.id,
        case_title: caseItem.title,
        description: `${caseItem.priority} priority case`,
        due_date: caseItem.created_at
      });
    });

    // Sort by urgency
    const urgencyOrder = { overdue: 0, urgent: 1, today: 2, high: 3 };
    items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return items;
  };

  const getSummary = () => {
    const attentionCount = getAttentionItems().length;
    if (attentionCount === 0) {
      return 'Nothing urgent today — nice work';
    }
    return `You have ${data.stats.total_open} open cases, ${attentionCount} need${attentionCount === 1 ? 's' : ''} attention today`;
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

  const attentionItems = getAttentionItems();

  return (
    <div className="p-8">
      {/* Personal Greeting Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          {getGreeting()}, {user?.first_name || 'Officer'}
        </h1>
        <p className="text-lg text-gray-600 mt-2">{getSummary()}</p>
      </div>

      {/* Needs Your Attention Today Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚡</span> Needs Your Attention Today ({attentionItems.length})
        </h2>
        {attentionItems.length === 0 ? (
          <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Nothing urgent today — nice work!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attentionItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(`/dashboard/cases/${item.case_id}`)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  item.urgency === 'overdue' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                  item.urgency === 'urgent' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
                  item.urgency === 'today' ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' :
                  'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{item.case_title}</p>
                  <Badge variant={
                    item.urgency === 'overdue' ? 'danger' :
                    item.urgency === 'urgent' ? 'danger' :
                    item.urgency === 'today' ? 'warning' :
                    'warning'
                  }>
                    {item.urgency === 'overdue' ? 'Overdue' :
                     item.urgency === 'urgent' ? 'Urgent' :
                     item.urgency === 'today' ? 'Today' : 'High Priority'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{item.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.type === 'deadline' && `Due: ${new Date(item.due_date).toLocaleString()}`}
                  {item.type === 'hearing' && `Hearing: ${new Date(item.due_date).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Cases Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Cases ({data.my_open_cases.length})</h2>
        {data.my_open_cases.length === 0 ? (
          <p className="text-sm text-gray-500">No open cases</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.my_open_cases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    onClick={() => navigate(`/dashboard/cases/${caseItem.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{caseItem.case_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{caseItem.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="default">{caseItem.status}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={caseItem.priority === 'urgent' ? 'danger' : caseItem.priority === 'high' ? 'warning' : 'default'}>
                        {caseItem.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getDaysSince(caseItem.created_at)} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Hearings (Next 14 Days)</h3>
            {data.my_upcoming_hearings.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming hearings</p>
            ) : (
              <div className="space-y-2">
                {data.my_upcoming_hearings.slice(0, 5).map((hearing) => (
                  <div
                    key={hearing.id}
                    onClick={() => navigate(`/dashboard/cases/${hearing.case__id}`)}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-900">{hearing.case__case_id} - {hearing.case__title}</p>
                    <p className="text-xs text-gray-600">{new Date(hearing.hearing_date).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{hearing.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Deadlines</h3>
            {data.my_deadlines.length === 0 ? (
              <p className="text-sm text-gray-500">No pending deadlines</p>
            ) : (
              <div className="space-y-2">
                {data.my_deadlines.slice(0, 5).map((deadline) => (
                  <div
                    key={deadline.id}
                    onClick={() => navigate(`/dashboard/cases/${deadline.case__id}`)}
                    className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                      deadline.is_overdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{deadline.case__case_id} - {deadline.case__title}</p>
                    <p className="text-xs text-gray-600">{deadline.description}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(deadline.due_date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Closed Strip */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Closed This Month</h2>
        {data.recently_closed.length === 0 ? (
          <p className="text-sm text-gray-500">No cases closed this month</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {data.recently_closed.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => navigate(`/dashboard/cases/${caseItem.id}`)}
                className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer"
              >
                <p className="text-sm font-medium text-green-900">{caseItem.case_id}</p>
                <p className="text-xs text-green-700">{caseItem.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
