import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Building2, 
  Users, 
  Factory, 
  FileText, 
  BarChart3,
  Menu,
  X,
 
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Asset Categories', href: '/asset-categories', icon: Package },
    { name: 'Asset Subcategories', href: '/asset-subcategories', icon: Package },
    { name: 'Branches', href: '/branches', icon: Building2 },
    { name: 'Vendors', href: '/vendors', icon: Users },
    { name: 'Manufacturers', href: '/manufacturers', icon: Factory },
    { name: 'GRNs', href: '/grns', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 shadow-2xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-indigo-500 border-opacity-30">
            <h1 className="text-xl font-bold text-white drop-shadow-lg">Asset Management</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-indigo-500 hover:bg-opacity-30 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-white bg-opacity-20 text-black shadow-lg  border-white border-opacity-20'
                      : 'text-indigo-100 '
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-white' : 'text-indigo-300'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
         
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 shadow-2xl">
          <div className="flex h-16 items-center px-4 border-b border-indigo-500 border-opacity-30">
            <h1 className="text-xl font-bold text-white drop-shadow-lg">Asset Management</h1>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-white bg-opacity-20 text-black shadow-lg  border-white border-opacity-20'
                      : 'text-indigo-100 '
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-black' : 'text-indigo-300 '
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center">
                <span className="text-sm font-medium text-white">Welcome to Asset Management</span>
              </div>
            </div>
          </div>
        </div>
        <main className=" h-screen">
          <div className="mx-auto w-full ">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;