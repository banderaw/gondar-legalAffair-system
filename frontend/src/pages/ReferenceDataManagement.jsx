import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getCampuses, createCampus, updateCampus, deleteCampus,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCaseCategories, createCaseCategory, updateCaseCategory, deleteCaseCategory
} from '../api/core';
import Button from '../components/Button';

const ReferenceDataManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campuses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [caseCategories, setCaseCategories] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      setLoading(false);
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      const [campusesData, departmentsData, categoriesData] = await Promise.all([
        getCampuses(),
        getDepartments(),
        getCaseCategories()
      ]);
      setCampuses(campusesData.results || campusesData);
      setDepartments(departmentsData.results || departmentsData);
      setCaseCategories(categoriesData.results || categoriesData);
    } catch (err) {
      setError('Failed to load reference data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    if (activeTab === 'campuses') {
      setFormData({ name: '', code: '' });
    } else if (activeTab === 'departments') {
      setFormData({ name: '', code: '', campus: '' });
    } else if (activeTab === 'categories') {
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'campuses') {
      setFormData({ name: item.name, code: item.code });
    } else if (activeTab === 'departments') {
      setFormData({ name: item.name, code: item.code, campus: item.campus });
    } else if (activeTab === 'categories') {
      setFormData({ name: item.name, description: item.description });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeTab === 'campuses') {
        await deleteCampus(id);
      } else if (activeTab === 'departments') {
        await deleteDepartment(id);
      } else if (activeTab === 'categories') {
        await deleteCaseCategory(id);
      }
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'campuses') {
        if (editingItem) {
          await updateCampus(editingItem.id, formData);
        } else {
          await createCampus(formData);
        }
      } else if (activeTab === 'departments') {
        if (editingItem) {
          await updateDepartment(editingItem.id, formData);
        } else {
          await createDepartment(formData);
        }
      } else if (activeTab === 'categories') {
        if (editingItem) {
          await updateCaseCategory(editingItem.id, formData);
        } else {
          await createCaseCategory(formData);
        }
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(editingItem ? 'Failed to update item' : 'Failed to create item');
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

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">Reference Data Management</h1>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('campuses')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'campuses'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Campuses
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'departments'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Case Categories
          </button>
        </div>

        {/* Content */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {activeTab.replace('_', ' ')}
          </h2>
          <Button onClick={handleAdd}>Add {activeTab.slice(0, -1)}</Button>
        </div>

        {/* Campuses Table */}
        {activeTab === 'campuses' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campuses.map((campus) => (
                  <tr key={campus.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{campus.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{campus.code}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button size="sm" onClick={() => handleEdit(campus)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(campus.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Departments Table */}
        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{dept.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{dept.campus_name || dept.campus}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button size="sm" onClick={() => handleEdit(dept)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(dept.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Case Categories Table */}
        {activeTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caseCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{category.description || '-'}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button size="sm" onClick={() => handleEdit(category)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(category.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'campuses' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        required
                      />
                    </div>
                  </>
                )}
                {activeTab === 'departments' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
                      <select
                        value={formData.campus}
                        onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        required
                      >
                        <option value="">Select campus...</option>
                        {campuses.map((campus) => (
                          <option key={campus.id} value={campus.id}>
                            {campus.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {activeTab === 'categories' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        rows="3"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit">{editingItem ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferenceDataManagement;
