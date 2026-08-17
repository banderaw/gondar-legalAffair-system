import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCases, getCampuses, getCategories, getDepartments } from '../api/cases';
import Button from '../components/Button';
import Badge from '../components/Badge';

const STATUS_COLORS = {
  registered: 'info',
  active: 'success',
  under_review: 'warning',
  in_progress: 'info',
  closed: 'default',
};

const PRIORITY_COLORS = {
  low: 'default',
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
};

const CaseList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter states
  const statusFilter = searchParams.get('status') || '';
  const priorityFilter = searchParams.get('priority') || '';
  const categoryFilter = searchParams.get('category') || '';
  const campusFilter = searchParams.get('campus') || '';
  const departmentFilter = searchParams.get('department') || '';
  const searchQuery = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchCases();
    fetchCampuses();
    fetchCategories();
    if (campusFilter) {
      fetchDepartments();
    }
  }, [searchParams, campusFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
        campus: campusFilter || undefined,
        department: departmentFilter || undefined,
        search: searchQuery || undefined,
      };
      
      const data = await getCases(params);
      setCases(data.results || data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cases');
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const data = await getCampuses();
      setCampuses(data.results || data);
    } catch (err) {
      console.error('Error fetching campuses:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.results || data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      const filtered = (data.results || data).filter(dept => dept.campus_id == campusFilter);
      setDepartments(filtered);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset department filter when campus changes
    if (key === 'campus') {
      newParams.delete('department');
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', searchQuery);
  };

  const handleRowClick = (caseId) => {
    navigate(`/dashboard/cases/${caseId}`);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Cases</h1>
            <p className="text-gray-600 mt-2">Manage and track legal cases</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by case ID or title..."
                value={searchQuery}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200 pl-10"
              />
              <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="active">Active</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => updateFilter('priority', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus</label>
            <select
              value={campusFilter}
              onChange={(e) => updateFilter('campus', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Campuses</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => updateFilter('department', e.target.value)}
              disabled={!campusFilter}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading cases...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center">
            <svg className="mx-auto h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-red-600 font-semibold">{error}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-16 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-600 font-medium">No cases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Campus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assigned Officer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    onClick={() => handleRowClick(caseItem.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-900">
                      {caseItem.case_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {caseItem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {caseItem.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {caseItem.campus_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={STATUS_COLORS[caseItem.status] || 'default'}>
                        {caseItem.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={PRIORITY_COLORS[caseItem.priority] || 'default'}>
                        {caseItem.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {caseItem.assigned_officer_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(caseItem.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 font-medium">
          Showing page {page}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => updateFilter('page', page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => updateFilter('page', page + 1)}
            disabled={cases.length === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseList;
