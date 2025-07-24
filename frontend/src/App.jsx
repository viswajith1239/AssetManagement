import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import AssetCategories from './pages/AssetCategories';
import AssetSubcategories from './pages/AssetSubcategories';
import Branches from './pages/Branches';
import Vendors from './pages/Vendors';
import Manufacturers from './pages/Manufacturers';
import GRNList from './pages/GRN/GRNList';
import GRNForm from './pages/GRN/GRNForm';
import Reports from './pages/Report';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/asset-categories" element={<AssetCategories />} />
            <Route path="/asset-subcategories" element={<AssetSubcategories />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/manufacturers" element={<Manufacturers />} />
            <Route path="/grns" element={<GRNList />} />
            <Route path="/grns/new" element={<GRNForm />} />
            <Route path="/grns/:id" element={<GRNForm />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
    
  );
}

export default App; 