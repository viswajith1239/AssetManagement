import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Building2, 
  Users, 
  FileText, 
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { assetCategoriesAPI, branchesAPI, vendorsAPI, grnsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    branches: 0,
    vendors: 0,
    grns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, branchesRes, vendorsRes, grnsRes] = await Promise.all([
          assetCategoriesAPI.getAll({ limit: 1 }),
          branchesAPI.getAll({ limit: 1 }),
          vendorsAPI.getAll({ limit: 1 }),
          grnsAPI.getAll({ limit: 1 }),
        ]);

        setStats({
          categories: categoriesRes.data.pagination?.totalItems || 0,
          branches: branchesRes.data.pagination?.totalItems || 0,
          vendors: vendorsRes.data.pagination?.totalItems || 0,
          grns: grnsRes.data.pagination?.totalItems || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      name: 'Create GRN',
      href: '/grns/new',
      icon: Plus,
      description: 'Create a new Goods Received Note',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      name: 'Add Vendor',
      href: '/vendors',
      icon: Users,
      description: 'Add a new vendor to the system',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
    },
    {
      name: 'Add Branch',
      href: '/branches',
      icon: Building2,
      description: 'Add a new branch location',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      name: 'View Reports',
      href: '/reports',
      icon: BarChart3,
      description: 'Generate and view comprehensive reports',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
    },
  ];

  const statsConfig = [
    {
      title: 'Asset Categories',
      value: stats.categories,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Branches',
      value: stats.branches,
      icon: Building2,
      gradient: 'from-green-500 to-green-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Vendors',
      value: stats.vendors,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'GRNs',
      value: stats.grns,
      icon: FileText,
      gradient: 'from-orange-500 to-orange-600',
      change: '+23%',
      changeType: 'increase'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600 text-center">
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-indigo-600 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Asset Management Dashboard
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Welcome back! Here's a comprehensive overview of your asset management system.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`bg-gradient-to-r ${stat.gradient} px-6 py-4`}>
                  <div className="flex items-center justify-between">
                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="flex items-center text-white text-opacity-90 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Total {stat.title.toLowerCase()} in system
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-50 px-8 py-6 border-b border-indigo-200">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-indigo-900">Quick Actions</h2>
                <p className="text-indigo-600 mt-1">Streamline your workflow with these shortcuts</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-transparent hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`bg-gradient-to-r ${action.gradient} ${action.hoverGradient} p-4 rounded-xl mb-4 transition-all duration-300 group-hover:shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-900 transition-colors">
                        {action.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-lg p-2 mr-3">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-gray-600 mt-1">Stay updated with your latest system activities</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Recent Activity</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Get started by creating your first GRN, adding vendors, or setting up branch locations to see activity here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/grns/new"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create GRN
                </Link>
                <Link
                  to="/vendors"
                  className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Add Vendor
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">System Overview</h2>
                <p className="text-indigo-100 mt-1">Your asset management system at a glance</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Management</h3>
                <p className="text-gray-600 text-sm">
                  Organize and track your assets with comprehensive categorization
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GRN Processing</h3>
                <p className="text-gray-600 text-sm">
                  Streamlined goods received note management and tracking
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
                <p className="text-gray-600 text-sm">
                  Generate insights with comprehensive reporting tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;