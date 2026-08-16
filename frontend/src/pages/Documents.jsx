import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, downloadDocument } from '../api/documents';
import { getCases } from '../api/cases';
import Badge from '../components/Badge';
import Button from '../components/Button';

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    case: '',
    is_confidential: '',
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    case: '',
    title: '',
    file: null,
    is_confidential: false,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCases();
  }, [filters]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filters.case) params.case = filters.case;
      if (filters.is_confidential !== '') params.is_confidential = filters.is_confidential;
      
      const data = await getDocuments(params);
      setDocuments(data.results || data);
    } catch (err) {
      setError('Failed to load documents');
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

  const handleDownload = async (document) => {
    try {
      const data = await downloadDocument(document.id);
      window.open(data.file_url, '_blank');
    } catch (err) {
      setError('Failed to download document');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('case', uploadData.case);
      formData.append('title', uploadData.title);
      formData.append('file', uploadData.file);
      formData.append('is_confidential', uploadData.is_confidential);
      
      await createDocument(formData);
      setShowUploadModal(false);
      setUploadData({ case: '', title: '', file: null, is_confidential: false });
      fetchData();
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return '🖼️';
    return '📎';
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
          <h1 className="text-2xl font-serif font-bold text-gray-900">Documents</h1>
          <Button onClick={() => setShowUploadModal(true)}>Upload Document</Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Case</label>
            <select
              value={filters.case}
              onChange={(e) => setFilters({ ...filters, case: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">All Cases</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.case_id} - {caseItem.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confidential Status</label>
            <select
              value={filters.is_confidential}
              onChange={(e) => setFilters({ ...filters, is_confidential: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">All</option>
              <option value="true">Confidential</option>
              <option value="false">Not Confidential</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        {documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{getFileIcon(doc.file)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{doc.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/dashboard/cases/${doc.case_id}`)}
                        className="text-blue-900 hover:text-blue-700 font-medium"
                      >
                        {doc.case_title}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doc.uploaded_by?.username || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.is_confidential && (
                        <Badge variant="danger">Confidential</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Button size="sm" onClick={() => handleDownload(doc)}>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case</label>
                <select
                  value={uploadData.case}
                  onChange={(e) => setUploadData({ ...uploadData, case: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Allowed: PDF, DOCX, JPG, PNG (max 10MB)</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={uploadData.is_confidential}
                  onChange={(e) => setUploadData({ ...uploadData, is_confidential: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="confidential" className="text-sm text-gray-700">Confidential</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                <Button type="submit" loading={uploading}>Upload</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
