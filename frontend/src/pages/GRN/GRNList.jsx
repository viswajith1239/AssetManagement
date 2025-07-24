import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { grnsAPI, vendorsAPI, branchesAPI } from '../../services/api';

const GRNList = () => {
  const [allGrns, setAllGrns] = useState([]); 
  const [filteredGrns, setFilteredGrns] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    vendorId: '',
    branchId: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

 
  const fetchMasterData = useCallback(async () => {
    try {
      const [vendorsRes, branchesRes] = await Promise.all([
        vendorsAPI.getAll({ limit: 1000 }),
        branchesAPI.getAll({ limit: 1000 }),
      ]);

      setVendors(vendorsRes.data.data || []);
      setBranches(branchesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  }, []);


  const fetchGRNs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await grnsAPI.getAll({ limit: 1000 }); 
      setAllGrns(response.data.data || []);
      setFilteredGrns(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let filtered = [...allGrns];

  
    if (searchTerm.trim()) {
      filtered = filtered.filter(grn => 
        grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grn.invoiceNumber && grn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (grn.vendorId?.name && grn.vendorId.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

   
    if (filters.status) {
      filtered = filtered.filter(grn => grn.status === filters.status);
    }

    if (filters.vendorId) {
      filtered = filtered.filter(grn => grn.vendorId?._id === filters.vendorId);
    }

    if (filters.branchId) {
      filtered = filtered.filter(grn => grn.branchId?._id === filters.branchId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(grn => new Date(grn.grnDate) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(grn => new Date(grn.grnDate) <= new Date(filters.endDate));
    }

    setFilteredGrns(filtered);
   
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filters, allGrns]);

  useEffect(() => {
    fetchMasterData();
    fetchGRNs();
  }, [fetchMasterData, fetchGRNs]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this GRN?')) {
      try {
        await grnsAPI.delete(id);
      
        setAllGrns(prev => prev.filter(grn => grn._id !== id));
      } catch (error) {
        console.error('Error deleting GRN:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await grnsAPI.exportReport({ ...filters, search: searchTerm });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `grn_register_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      vendorId: '',
      branchId: '',
      startDate: '',
      endDate: '',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  from-amber-400 to-amber-600 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">GRNs</h1>
            <p className="mt-1 text-indigo-100">
              Manage your Goods Received Notes
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="bg-white text-amber-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
            <Link
              to="/grns/new"
              className="bg-white text-amber-600  px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create GRN
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                  placeholder="Search GRNs by number, invoice, or vendor..."
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-amber-600 text-white  px-6 py-3 rounded-lg font-semibold flex items-center transition-colors cursor-pointer"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <select 
                  value={filters.vendorId}
                  onChange={(e) => handleFilterChange('vendorId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select 
                  value={filters.branchId}
                  onChange={(e) => handleFilterChange('branchId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={clearFilters}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">GRN Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">GRN Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Invoice Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Branch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Total Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGrns.map((grn) => (
                  <tr key={grn._id} className="hover:bg-indigo-25 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{grn.grnNumber}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {grn.grnDate ? new Date(grn.grnDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{grn.invoiceNumber || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{grn.vendorId?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{grn.branchId?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      ₹{grn.grandTotal?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(grn.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <Link
                          to={`/grns/${grn._id}`}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/grns/${grn._id}/edit`}
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(grn._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
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

          {filteredGrns.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm || Object.values(filters).some(f => f) ? 'No GRNs match your search criteria' : 'No GRNs found'}
              </p>
              {!searchTerm && !Object.values(filters).some(f => f) && (
                <Link 
                  to="/grns/new" 
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold  transition-colors mt-4 inline-block"
                >
                  Create your first GRN
                </Link>
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
              <span className="flex items-center px-4 py-2 text-sm text-gray-700 bg-indigo-100 rounded-lg">
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

export default GRNList;