import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAgreements, createAgreement } from '../api/agreements';
import { getCases } from '../api/cases';
import { createDocument } from '../api/documents';
import Badge from '../components/Badge';
import Button from '../components/Button';

const Agreements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [formData, setFormData] = useState({
    case: '',
    sponsored_person: '',
    sponsorship_start_date: '',
    sponsorship_end_date: '',
    total_amount: '',
    guarantee_details: '',
    supporting_document: null,
  });

  useEffect(() => {
    if (user?.role === 'staff') {
      setError('Access denied. Scholarship agreements are restricted to admin, head, and legal officers.');
      setLoading(false);
      return;
    }
    fetchData();
    fetchCases();
  }, [user]);

  const fetchData = async () => {
    try {
      const data = await getAgreements();
      setAgreements(data.results || data);
    } catch (err) {
      setError('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const data = await getCases();
      // Filter to scholarship-category cases only
      const scholarshipCases = (data.results || data).filter(
        caseItem => caseItem.category__name?.toLowerCase().includes('scholarship')
      );
      setCases(scholarshipCases);
    } catch (err) {
      console.error('Failed to load cases');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // First upload document if provided
      let documentId = null;
      if (formData.supporting_document) {
        const docFormData = new FormData();
        docFormData.append('case', formData.case);
        docFormData.append('title', `Scholarship Agreement - ${formData.sponsored_person}`);
        docFormData.append('file', formData.supporting_document);
        docFormData.append('is_confidential', 'true');
        
        const docData = await createDocument(docFormData);
        documentId = docData.id;
      }

      // Create agreement
      const agreementData = {
        case: formData.case || null,
        sponsored_person: formData.sponsored_person,
        sponsorship_start_date: formData.sponsorship_start_date,
        sponsorship_end_date: formData.sponsorship_end_date,
        total_amount: formData.total_amount,
        guarantee_details: formData.guarantee_details,
        supporting_document: documentId,
      };

      await createAgreement(agreementData);
      setShowModal(false);
      setFormData({
        case: '',
        sponsored_person: '',
        sponsorship_start_date: '',
        sponsorship_end_date: '',
        total_amount: '',
        guarantee_details: '',
        supporting_document: null,
      });
      fetchData();
    } catch (err) {
      setError('Failed to create agreement');
    } finally {
      setCreating(false);
    }
  };

  const getAgreementStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { text: 'Upcoming', variant: 'info' };
    if (now > end) return { text: 'Completed', variant: 'default' };
    return { text: 'Active', variant: 'success' };
  };

  const getProgressPercentage = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
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
          <h1 className="text-2xl font-serif font-bold text-gray-900">Scholarship Agreements</h1>
          <Button onClick={() => setShowModal(true)}>New Agreement</Button>
        </div>

        {agreements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No scholarship agreements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sponsored Person</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agreements.map((agreement) => {
                  const status = getAgreementStatus(
                    agreement.sponsorship_start_date,
                    agreement.sponsorship_end_date
                  );
                  const progress = getProgressPercentage(
                    agreement.sponsorship_start_date,
                    agreement.sponsorship_end_date
                  );

                  return (
                    <tr
                      key={agreement.id}
                      onClick={() => agreement.case_id && navigate(`/dashboard/cases/${agreement.case_id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {agreement.sponsored_person}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">
                        {agreement.case_title || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(agreement.sponsorship_start_date).toLocaleDateString()} - {' '}
                        {new Date(agreement.sponsorship_end_date).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {agreement.sponsorship_duration_months} months
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        ${parseFloat(agreement.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {status.text === 'Active' && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-900 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        )}
                        {status.text !== 'Active' && (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Agreement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">New Scholarship Agreement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case (Optional)</label>
                <select
                  value={formData.case}
                  onChange={(e) => setFormData({ ...formData, case: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="">No case (standalone agreement)</option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.case_id} - {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsored Person</label>
                <input
                  type="text"
                  value={formData.sponsored_person}
                  onChange={(e) => setFormData({ ...formData, sponsored_person: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.sponsorship_start_date}
                    onChange={(e) => setFormData({ ...formData, sponsorship_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.sponsorship_end_date}
                    onChange={(e) => setFormData({ ...formData, sponsorship_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Details</label>
                <textarea
                  value={formData.guarantee_details}
                  onChange={(e) => setFormData({ ...formData, guarantee_details: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, supporting_document: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-1">Allowed: PDF, DOCX, JPG, PNG (max 10MB)</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" loading={creating}>Create Agreement</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agreements;
