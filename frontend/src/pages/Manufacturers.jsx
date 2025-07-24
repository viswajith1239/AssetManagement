import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { manufacturersAPI } from '../services/api';

const Manufacturers = () => {
  const [allManufacturers, setAllManufacturers] = useState([]); 
  const [filteredManufacturers, setFilteredManufacturers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  
  const fetchManufacturers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await manufacturersAPI.getAll();
      setAllManufacturers(response.data.data || []);
      setFilteredManufacturers(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredManufacturers(allManufacturers);
    } else {
      const filtered = allManufacturers.filter(manufacturer => 
        manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (manufacturer.description && manufacturer.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredManufacturers(filtered);
    }
  
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, allManufacturers]);


  useEffect(() => {
    fetchManufacturers();
  }, [fetchManufacturers]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingManufacturer) {
        await manufacturersAPI.update(editingManufacturer._id, formData);
     
        const updatedManufacturer = { ...formData, _id: editingManufacturer._id, createdAt: editingManufacturer.createdAt };
        setAllManufacturers(prev => prev.map(m => m._id === editingManufacturer._id ? updatedManufacturer : m));
      } else {
        const response = await manufacturersAPI.create(formData);
       
        setAllManufacturers(prev => [...prev, response.data]);
      }
      
      setShowForm(false);
      setEditingManufacturer(null);
      resetForm();
    } catch (error) {
      console.error('Error saving manufacturer:', error);
    }
  };

  const handleEdit = (manufacturer) => {
    setEditingManufacturer(manufacturer);
    setFormData({ ...manufacturer });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this manufacturer?')) {
      try {
        await manufacturersAPI.delete(id);
       
        setAllManufacturers(prev => prev.filter(m => m._id !== id));
      } catch (error) {
        console.error('Error deleting manufacturer:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingManufacturer(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 to-amber-600 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Manufacturers</h1>
            <p className="mt-1 text-blue-100">
              Manage your equipment manufacturers
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-amber-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Manufacturer
          </button>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingManufacturer ? 'Edit Manufacturer' : 'Add Manufacturer'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter manufacturer name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none hover:border-gray-400"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors hover:border-gray-400"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-6">
                  <button 
                    type="button"
                    onClick={onSubmit}
                    className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold  transition-colors cursor-pointer"
                  >
                    {editingManufacturer ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors hover:border-gray-400"
                  placeholder="Search manufacturers..."
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Created At</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredManufacturers.map((manufacturer) => (
                  <tr key={manufacturer._id} className="hover:bg-blue-25 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{manufacturer.name}</td>
                    <td className="px-6 py-4 text-gray-700">{manufacturer.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        manufacturer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {manufacturer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {manufacturer.createdAt ? new Date(manufacturer.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(manufacturer)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(manufacturer._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredManufacturers.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No manufacturers match your search' : 'No manufacturers found'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold  transition-colors mt-4 cursor-pointer"
                >
                  Add your first manufacturer
                </button>
              )}
            </div>
          )}
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-700 bg-blue-100 rounded-lg">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Manufacturers;