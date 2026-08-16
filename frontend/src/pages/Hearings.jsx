import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHearings, createHearing, getDeadlines, markDeadlineResolved } from '../api/hearings';
import { getCases } from '../api/cases';
import Badge from '../components/Badge';
import Button from '../components/Button';

const Hearings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [hearings, setHearings] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [hearingData, setHearingData] = useState({
    case: '',
    hearing_date: '',
    location: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCases();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const now = new Date();
      const [hearingsData, deadlinesData] = await Promise.all([
        getHearings(),
        getDeadlines({ is_resolved: false })
      ]);
      
      const allHearings = hearingsData.results || hearingsData;
      const allDeadlines = deadlinesData.results || deadlinesData;
      
      if (activeTab === 'upcoming') {
        setHearings(allHearings.filter(h => new Date(h.hearing_date) >= now));
        setDeadlines(allDeadlines.filter(d => new Date(d.due_date) >= now));
      } else {
        setHearings(allHearings.filter(h => new Date(h.hearing_date) < now));
        setDeadlines(allDeadlines.filter(d => new Date(d.due_date) < now));
      }
    } catch (err) {
      setError('Failed to load hearings and deadlines');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const data = await getCases();
      setCases(data.results || data);
    } catch (err) {
      console.error('Failed to load cases');
    }
  };

  const handleScheduleHearing = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createHearing(hearingData);
      setShowHearingModal(false);
      setHearingData({ case: '', hearing_date: '', location: '', notes: '' });
      fetchData();
    } catch (err) {
      setError('Failed to schedule hearing');
    } finally {
      setCreating(false);
    }
  };

  const handleMarkResolved = async (deadlineId) => {
    try {
      await markDeadlineResolved(deadlineId);
      fetchData();
    } catch (err) {
      setError('Failed to mark deadline as resolved');
    }
  };

  const getDaysUntil = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysBadge = (dateString) => {
    const days = getDaysUntil(dateString);
    if (days < 0) return { text: 'Overdue', variant: 'danger' };
    if (days === 0) return { text: 'Today', variant: 'danger' };
    if (days === 1) return { text: 'Tomorrow', variant: 'warning' };
    if (days <= 7) return { text: `In ${days} days`, variant: 'warning' };
    return { text: `In ${days} days`, variant: 'info' };
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
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Hearings & Deadlines</h1>
          <Button onClick={() => setShowHearingModal(true)}>Schedule Hearing</Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'past'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past
          </button>
        </div>

        {/* Hearings Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {activeTab === 'upcoming' ? 'Upcoming Hearings' : 'Past Hearings'}
          </h2>
          {hearings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hearings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hearings.map((hearing) => (
                    <tr
                      key={hearing.id}
                      onClick={() => navigate(`/dashboard/cases/${hearing.case_id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(hearing.hearing_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">
                        {hearing.case_title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{hearing.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getDaysBadge(hearing.hearing_date).variant}>
                          {getDaysBadge(hearing.hearing_date).text}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deadlines Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {activeTab === 'upcoming' ? 'Upcoming Deadlines' : 'Past Deadlines'}
          </h2>
          {deadlines.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No deadlines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deadlines.map((deadline) => (
                    <tr
                      key={deadline.id}
                      onClick={() => navigate(`/dashboard/cases/${deadline.case_id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(deadline.due_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">
                        {deadline.case_title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{deadline.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getDaysBadge(deadline.due_date).variant}>
                          {getDaysBadge(deadline.due_date).text}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkResolved(deadline.id);
                          }}
                        >
                          Mark Resolved
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Hearing Modal */}
      {showHearingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Hearing</h2>
            <form onSubmit={handleScheduleHearing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case</label>
                <select
                  value={hearingData.case}
                  onChange={(e) => setHearingData({ ...hearingData, case: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                >
                  <option value="">Select case...</option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.case_id} - {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={hearingData.hearing_date}
                  onChange={(e) => setHearingData({ ...hearingData, hearing_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={hearingData.location}
                  onChange={(e) => setHearingData({ ...hearingData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={hearingData.notes}
                  onChange={(e) => setHearingData({ ...hearingData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowHearingModal(false)}>Cancel</Button>
                <Button type="submit" loading={creating}>Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hearings;
