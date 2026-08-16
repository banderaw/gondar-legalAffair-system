import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCase } from '../api/cases';
import { getCampuses, getDepartments, getCategories } from '../api/cases';
import Button from '../components/Button';

const SubmitCase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [newCaseId, setNewCaseId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    campus_id: '',
    department_id: '',
    concerned_party: '',
    description: '',
    priority: 'normal',
  });

  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [campusesData, departmentsData, categoriesData] = await Promise.all([
        getCampuses(),
        getDepartments(),
        getCategories()
      ]);
      setCampuses(campusesData.results || campusesData);
      setDepartments(departmentsData.results || departmentsData);
      setCategories(categoriesData.results || categoriesData);
    } catch (err) {
      console.error('Failed to load reference data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createCase(formData);
      setNewCaseId(response.case_id);
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Case Submitted Successfully</h2>
          <p className="text-gray-600 mb-2">
            Your case has been registered with ID:
          </p>
          <p className="text-2xl font-bold text-blue-900 mb-6">{newCaseId}</p>
          <p className="text-gray-600 mb-6">
            The Legal Affairs Office will review your submission and assign it to an officer.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
            <Button onClick={() => {
              setSuccess(false);
              setNewCaseId(null);
              setFormData({
                title: '',
                category_id: '',
                campus_id: '',
                department_id: '',
                concerned_party: '',
                description: '',
                priority: 'normal',
              });
            }}>
              Submit Another Case
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-900 hover:text-blue-700 font-medium mb-4 inline-block"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Submit a Case</h1>
        <p className="text-gray-600">
          Provide the details of your case for the Legal Affairs Office to review
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Case Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Brief title describing the case"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              A short, descriptive title for your case
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Type of legal matter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus *
              </label>
              <select
                name="campus_id"
                value={formData.campus_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              >
                <option value="">Select campus...</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Campus location
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Select department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Your department (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concerned Party *
            </label>
            <input
              type="text"
              name="concerned_party"
              value={formData.concerned_party}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Name of the person or organization involved"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Who is this case about?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              rows="5"
              placeholder="Provide detailed information about the case..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe the situation, relevant details, and what you need help with
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              required
            >
              <option value="low">Low - Not time-sensitive</option>
              <option value="normal">Normal - Standard processing</option>
              <option value="high">High - Needs attention soon</option>
              <option value="urgent">Urgent - Immediate attention required</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How urgent is this matter?
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Submit Case
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitCase;
