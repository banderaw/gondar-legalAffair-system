import { useState, useEffect } from 'react';
import { getCampuses, getDepartments } from '../api/cases';

const CampusDepartmentSelect = ({ campus, department, onCampusChange, onDepartmentChange, campusRequired = false, useIds = false }) => {
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    if (campus) {
      fetchDepartments(campus);
    } else {
      setDepartments([]);
    }
  }, [campus]);

  const fetchCampuses = async () => {
    try {
      setLoading(true);
      const data = await getCampuses();
      console.log('Campuses loaded:', data.results || data);
      setCampuses(data.results || data);
    } catch (err) {
      console.error('Failed to load campuses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (campusValue) => {
    try {
      const data = await getDepartments();
      let filtered = [];
      
      if (useIds) {
        // campusValue is an ID
        filtered = (data.results || data).filter(dept => dept.campus_id == campusValue);
      } else {
        // campusValue is a name
        const campus = campuses.find(c => c.name === campusValue);
        if (campus) {
          filtered = (data.results || data).filter(dept => dept.campus_id == campus.id);
        }
      }
      setDepartments(filtered);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setDepartments([]);
    }
  };

  const handleCampusChange = (e) => {
    const newCampus = e.target.value;
    console.log('Campus selected:', newCampus);
    onCampusChange(newCampus);
    onDepartmentChange(''); // Reset department when campus changes
  };

  const handleDepartmentChange = (e) => {
    const newDepartment = e.target.value;
    console.log('Department selected:', newDepartment);
    onDepartmentChange(newDepartment);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campus {campusRequired && <span className="text-red-500">*</span>}
        </label>
        <select
          value={campus}
          onChange={handleCampusChange}
          disabled={loading}
          required={campusRequired}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
        >
          <option value="">Select Campus</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={useIds ? campus.id : campus.name}>
              {campus.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Department
        </label>
        <select
          value={department}
          onChange={handleDepartmentChange}
          disabled={!campus}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
        >
          <option value="">None</option>
          {departments.map((dept) => (
            <option key={dept.id} value={useIds ? dept.id : dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CampusDepartmentSelect;
