import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getReporterDashboard } from '../../api/dashboard';
import { getCaseDocuments, downloadDocument } from '../../api/documents';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const ReporterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [caseDocuments, setCaseDocuments] = useState({});
  const [loadingDocuments, setLoadingDocuments] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getReporterDashboard();
      setData(response);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseDocuments = async (caseId) => {
    if (caseDocuments[caseId]) {
      return; // Already loaded
    }
    
    setLoadingDocuments(prev => ({ ...prev, [caseId]: true }));
    try {
      const docs = await getCaseDocuments(caseId);
      // Filter to only show documents uploaded by the current user
      const userDocs = docs.results?.filter(doc => doc.uploaded_by === user.id) || [];
      setCaseDocuments(prev => ({ ...prev, [caseId]: userDocs }));
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocuments(prev => ({ ...prev, [caseId]: false }));
    }
  };

  const toggleCaseExpansion = async (caseId) => {
    if (expandedCaseId === caseId) {
      setExpandedCaseId(null);
    } else {
      setExpandedCaseId(caseId);
      await fetchCaseDocuments(caseId);
    }
  };

  const handleDownload = async (docId, docTitle) => {
    try {
      const response = await downloadDocument(docId);
      // Create a blob from the response
      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docTitle;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Failed to download document');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending_review':
        return 'warning';
      case 'registered':
        return 'info';
      case 'active':
      case 'in_progress':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'closed':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_review':
        return 'Pending Review';
      case 'registered':
        return 'Registered';
      case 'active':
        return 'In Progress';
      case 'in_progress':
        return 'In Progress';
      case 'under_review':
        return 'Under Review';
      case 'closed':
        return 'Closed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
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

  const hasSubmissions = data.total_submitted > 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Greeting Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
          Welcome, {user?.first_name || 'there'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track the cases you've submitted to the Legal Affairs Office
        </p>
      </div>

      {/* Submit a New Case CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl shadow-lg p-8 mb-12 text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">Submit a New Case</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Need legal assistance? Submit your case details and our team will review it promptly.
        </p>
        <Button
          onClick={() => navigate('/dashboard/submit-case')}
          className="bg-white text-blue-900 hover:bg-blue-50"
        >
          Start New Submission
        </Button>
      </div>

      {/* Status Summary */}
      {hasSubmissions && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Case Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.status_counts.map((item) => (
              <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                <Badge variant={getStatusBadgeVariant(item.status)} className="mt-2">
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {hasSubmissions ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Submissions</h3>
          <div className="space-y-4">
            {data.recent_submissions.map((caseItem) => (
              <div key={caseItem.id}>
                <div
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => toggleCaseExpansion(caseItem.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{caseItem.case_id}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(caseItem.status)}>
                        {getStatusLabel(caseItem.status)}
                      </Badge>
                      {caseItem.document_count > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {caseItem.document_count} file{caseItem.document_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{caseItem.title}</p>
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(caseItem.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {expandedCaseId === caseItem.id && (
                  <div className="mt-2 ml-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Your Attached Files</h4>
                    {loadingDocuments[caseItem.id] ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900"></div>
                      </div>
                    ) : caseDocuments[caseItem.id]?.length > 0 ? (
                      <div className="space-y-2">
                        {caseDocuments[caseItem.id].map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">{doc.title}</span>
                              <span className="text-xs text-gray-500">
                                ({new Date(doc.uploaded_at).toLocaleDateString()})
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc.id, doc.title);
                              }}
                              className="text-blue-900 hover:text-blue-700 text-sm font-medium"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No files attached</p>
                    )}
                  </div>
                )}
                
                {/* Show rejection reason if case is rejected */}
                {caseItem.status === 'rejected' && caseItem.rejection_reason && (
                  <div className="mt-2 ml-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Rejection Reason</h4>
                    <p className="text-sm text-red-700">{caseItem.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            You haven't submitted a case yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Click the button below to get started with your first case submission.
          </p>
          <Button onClick={() => navigate('/dashboard/submit-case')}>
            Submit Your First Case
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReporterDashboard;
