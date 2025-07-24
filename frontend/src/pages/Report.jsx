import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Download,
  BarChart3,
  FileText,
  TrendingUp,
  Calendar,
  Building,
  Users
} from 'lucide-react';
import { grnsAPI, vendorsAPI, branchesAPI } from '../services/api';

const Reports = () => {
  const [vendors, setVendors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      vendorId: '',
      branchId: '',
    },
  });

  const filters = watch();


  useEffect(() => {
    const fetchMasterData = async () => {
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
    };

    fetchMasterData();
  }, []);

  const generateGRNReport = async (data) => {
    try {
      setLoading(true);
      const response = await grnsAPI.generateReport(data);
      setReportData(response.data.data || []);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Error generating report');
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportGRNReport = async (data) => {
    try {
      setLoading(true);
      const response = await grnsAPI.exportReport(data);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `grn_register_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Error exporting report');
      console.error('Error exporting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    generateGRNReport(data);
  };

  const handleExport = (data) => {
    exportGRNReport(data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 to-amber-600 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Reports</h1>
            <p className="mt-1 text-indigo-100">
              Generate and export comprehensive business reports
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">GRN Register Report</h2>
                  <p className="text-blue-100 text-sm">Comprehensive GRN analysis</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Generate a comprehensive report of all Goods Received Notes with advanced filtering options and export capabilities.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors hover:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="inline h-4 w-4 mr-1" />
                      Vendor
                    </label>
                    <select 
                      {...register('vendorId')} 
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building className="inline h-4 w-4 mr-1" />
                      Branch
                    </label>
                    <select 
                      {...register('branchId')} 
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
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Generate Report
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport(filters)}
                    disabled={loading}
                    className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Excel
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Asset Summary Report</h2>
                  <p className="text-green-100 text-sm">Asset distribution analysis</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Comprehensive view of asset distribution by category and branch with detailed analytics and insights.
              </p>

              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Asset summary report with advanced analytics will be available in the next update. Stay tuned for powerful insights!
                </p>
                <div className="mt-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    In Development
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {reportData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">GRN Register Report Results</h3>
                  <p className="text-indigo-600 mt-1">
                    Showing <span className="font-semibold">{reportData.length}</span> records
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-semibold">
                    <BarChart3 className="inline h-4 w-4 mr-1" />
                    Report Generated
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">GRN Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">GRN Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vendor Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Branch Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Branch Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Tax</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grand Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-indigo-25 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{row['GRN Number']}</td>
                      <td className="px-6 py-4 text-gray-700">{row['GRN Date']}</td>
                      <td className="px-6 py-4 text-gray-700">{row['Invoice Number']}</td>
                      <td className="px-6 py-4 text-gray-700">{row['Vendor Name']}</td>
                      <td className="px-6 py-4 text-gray-700">{row['Branch Name']}</td>
                      <td className="px-6 py-4 text-gray-700">{row['Branch Location']}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        ₹{parseFloat(row['Total Amount'] || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        ₹{parseFloat(row['Total Tax'] || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-bold">
                        ₹{parseFloat(row['Grand Total'] || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(row['Status'])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total records: <span className="font-semibold text-gray-900">{reportData.length}</span>
                </div>
                <button
                  onClick={() => handleExport(filters)}
                  disabled={loading}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold flex items-center transition-colors text-sm cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export This Report
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Report</h3>
              <p className="text-gray-600 text-center">
                Please wait while we process your request...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;