import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCase, assignCase, updateCaseStatus, getCaseHistory } from '../api/cases';
import { getDocuments, createDocument } from '../api/documents';
import { getHearings, createHearing } from '../api/hearings';
import { getDeadlines, createDeadline, markDeadlineResolved } from '../api/hearings';
import { getAgreements } from '../api/agreements';
import { getLegalOfficers } from '../api/dashboard';
import Badge from '../components/Badge';
import Button from '../components/Button';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [caseData, setCaseData] = useState(null);
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [agreement, setAgreement] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);

  // Form data
  const [assignOfficerId, setAssignOfficerId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [hearingData, setHearingData] = useState({ hearing_date: '', location: '', notes: '' });
  const [deadlineData, setDeadlineData] = useState({ due_date: '', description: '' });

  // Loading states
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingHearing, setCreatingHearing] = useState(false);
  const [creatingDeadline, setCreatingDeadline] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [caseResponse, historyResponse, docsResponse, hearingsResponse, deadlinesResponse, agreementsResponse, officersResponse] = await Promise.all([
        getCase(id),
        getCaseHistory(id),
        getDocuments({ case: id }),
        getHearings({ case: id }),
        getDeadlines({ case: id }),
        getAgreements({ case: id }),
        getLegalOfficers()
      ]);
      
      setCaseData(caseResponse);
      setHistory(historyResponse);
      setDocuments(docsResponse.results || docsResponse);
      setHearings(hearingsResponse.results || hearingsResponse);
      setDeadlines(deadlinesResponse.results || deadlinesResponse);
      setAgreement((agreementsResponse.results || agreementsResponse)[0] || null);
      setOfficers(officersResponse);
    } catch (err) {
      setError('Failed to load case data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await assignCase(id, assignOfficerId);
      setShowAssignModal(false);
      setAssignOfficerId('');
      fetchData();
    } catch (err) {
      setError('Failed to assign case');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await updateCaseStatus(id, newStatus);
      setShowStatusModal(false);
      setNewStatus('');
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('case', id);
      formData.append('title', uploadTitle);
      formData.append('file', uploadFile);
      formData.append('is_confidential', 'false');
      
      await createDocument(formData);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchData();
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateHearing = async (e) => {
    e.preventDefault();
    setCreatingHearing(true);
    try {
      await createHearing({ ...hearingData, case: id });
      setShowHearingModal(false);
      setHearingData({ hearing_date: '', location: '', notes: '' });
      fetchData();
    } catch (err) {
      setError('Failed to schedule hearing');
    } finally {
      setCreatingHearing(false);
    }
  };

  const handleCreateDeadline = async (e) => {
    e.preventDefault();
    setCreatingDeadline(true);
    try {
      await createDeadline({ ...deadlineData, case: id });
      setShowDeadlineModal(false);
      setDeadlineData({ due_date: '', description: '' });
      fetchData();
    } catch (err) {
      setError('Failed to create deadline');
    } finally {
      setCreatingDeadline(false);
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

  const canAssign = user?.role === 'admin' || user?.role === 'head';

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
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/cases')}
          className="text-blue-900 hover:text-blue-700 font-medium mb-4 inline-block"
        >
          ← Back to Cases
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">{caseData.case_id}</h1>
            <h2 className="text-xl text-gray-700 mt-1">{caseData.title}</h2>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="default">{caseData.status}</Badge>
              <Badge variant={caseData.priority === 'urgent' ? 'danger' : caseData.priority === 'high' ? 'warning' : 'default'}>
                {caseData.priority}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {canAssign && (
              <Button variant="secondary" onClick={() => setShowAssignModal(true)}>
                Assign
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowStatusModal(true)}>
              Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium text-gray-900">{caseData.category?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Campus</p>
            <p className="font-medium text-gray-900">{caseData.campus?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium text-gray-900">{caseData.department?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Concerned Party</p>
            <p className="font-medium text-gray-900">{caseData.concerned_party}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium text-gray-900">{caseData.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registered By</p>
            <p className="font-medium text-gray-900">{caseData.registered_by?.username || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium text-gray-900">{new Date(caseData.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assigned Officer</p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{caseData.assigned_officer?.username || 'Unassigned'}</p>
              {canAssign && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-xs text-blue-900 hover:text-blue-700"
                >
                  Change
                </button>
              )}
            </div>
          </div>
          {caseData.closed_at && (
            <div>
              <p className="text-sm text-gray-500">Closed At</p>
              <p className="font-medium text-gray-900">{new Date(caseData.closed_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 px-6">
            {['history', 'documents', 'hearings', 'deadlines'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-medium border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Case History</h3>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No history entries</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-blue-900 pl-4">
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <p className="text-sm text-gray-600">{entry.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {entry.user?.username} • {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <Button onClick={() => setShowUploadModal(true)}>Upload Document</Button>
              </div>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents attached</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleString()} • {doc.uploaded_by?.username}
                        </p>
                      </div>
                      {doc.is_confidential && <Badge variant="danger">Confidential</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hearings Tab */}
          {activeTab === 'hearings' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hearings</h3>
                <Button onClick={() => setShowHearingModal(true)}>Schedule Hearing</Button>
              </div>
              {hearings.length === 0 ? (
                <p className="text-sm text-gray-500">No hearings scheduled</p>
              ) : (
                <div className="space-y-2">
                  {hearings.map((hearing) => (
                    <div key={hearing.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">{new Date(hearing.hearing_date).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{hearing.location}</p>
                      {hearing.notes && <p className="text-xs text-gray-500 mt-1">{hearing.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Deadlines Tab */}
          {activeTab === 'deadlines' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Deadlines</h3>
                <Button onClick={() => setShowDeadlineModal(true)}>Add Deadline</Button>
              </div>
              {deadlines.length === 0 ? (
                <p className="text-sm text-gray-500">No deadlines</p>
              ) : (
                <div className="space-y-2">
                  {deadlines.map((deadline) => (
                    <div key={deadline.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{deadline.description}</p>
                        <p className="text-sm text-gray-600">Due: {new Date(deadline.due_date).toLocaleString()}</p>
                      </div>
                      {!deadline.is_resolved && (
                        <Button size="sm" onClick={() => handleMarkResolved(deadline.id)}>
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agreement Section */}
      {caseData.category?.name?.toLowerCase().includes('scholarship') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarship Agreement</h3>
          {agreement ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-900">{agreement.sponsored_person}</p>
              <p className="text-sm text-green-700">
                ${parseFloat(agreement.total_amount).toLocaleString()} • {agreement.sponsorship_duration_months} months
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No scholarship agreement linked</p>
          )}
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assign Case</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Legal Officer</label>
                <select
                  value={assignOfficerId}
                  onChange={(e) => setAssignOfficerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                >
                  <option value="">Select officer...</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                <Button type="submit" loading={assigning}>Assign</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Status</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                >
                  <option value="">Select status...</option>
                  <option value="registered">Registered</option>
                  <option value="active">Active</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
                <Button type="submit" loading={updatingStatus}>Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                <Button type="submit" loading={uploading}>Upload</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal */}
      {showHearingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Hearing</h2>
            <form onSubmit={handleCreateHearing} className="space-y-4">
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
                <Button type="submit" loading={creatingHearing}>Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deadline Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Deadline</h2>
            <form onSubmit={handleCreateDeadline} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={deadlineData.due_date}
                  onChange={(e) => setDeadlineData({ ...deadlineData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={deadlineData.description}
                  onChange={(e) => setDeadlineData({ ...deadlineData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  rows="3"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowDeadlineModal(false)}>Cancel</Button>
                <Button type="submit" loading={creatingDeadline}>Add</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
