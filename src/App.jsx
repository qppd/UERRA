


import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { useAuthSession, signOut } from './useAuthSession';
import { useUserProfile, upsertUserProfile } from './useUserProfile';



import UserManagement from './UserManagement';
import DashboardLayout from './DashboardLayout';


import DashboardHome from './components/DashboardHome';
import ReportsPage from './components/ReportsPage';
import {
  AdminUsers,
  AdminAgencies,
  AdminCategories,
  AdminLogsAnalytics,
  AdminSystemInfo
} from './components/AdminPanel';

import OfflineHint from './components/OfflineHint';



function App() {
  const [page, setPage] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, loading } = useAuthSession();
  // Always call the hook, even if user is null
  const { profile, loading: profileLoading } = useUserProfile(user?.id);

  const handleLogin = () => setPage('dashboard');
  const handleRegister = () => setPage('dashboard');

  if (loading) return <div style={{textAlign:'center',marginTop:'3rem'}}><OfflineHint />Loading...</div>;

  if (user) {
    if (profileLoading) return <div style={{textAlign:'center',marginTop:'3rem'}}><OfflineHint />Loading profile...</div>;
    if (!profile && !profileLoading) {
      return (
        <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>
          <OfflineHint />
          <div>Failed to load profile. Please check your internet connection or contact support.</div>
        </div>
      );
    }
    if (profile?.error) {
      return (
        <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>
          <OfflineHint />
          <div>Error loading profile: {profile.error.message || 'Unknown error.'}</div>
        </div>
      );
    }
    // Sidebar links and page routing
    let links = [
      { label: 'Dashboard', page: 'dashboard', icon: 'fa fa-home' },
      { label: 'Reports', page: 'reports', icon: 'fa fa-clipboard-list' },
    ];
    if (profile?.role === 'superadmin') {
      links.push({ label: 'Users', page: 'admin_user', icon: 'fa fa-users-cog' });
      links.push({ label: 'Agencies', page: 'admin_agency', icon: 'fa fa-building' });
      links.push({ label: 'Categories', page: 'admin_category', icon: 'fa fa-list' });
      links.push({ label: 'Logs & Analytics', page: 'admin_logs', icon: 'fa fa-chart-bar' });
      links.push({ label: 'System Info', page: 'admin_info', icon: 'fa fa-info-circle' });
    }
    if (profile?.role === 'admin') {
      links.push({ label: 'Agency Management', page: 'agency', icon: 'fa fa-building' });
    }
    if (!profile?.role || profile?.role === 'citizen') {
      links.push({ label: 'My Reports', page: 'myreports', icon: 'fa fa-history' });
    }
    links.push({ label: 'Logout', page: 'logout', icon: 'fa fa-sign-out-alt' });

    // Render page content
    let pageContent = null;
    if (currentPage === 'dashboard') pageContent = <DashboardHome />;
    else if (currentPage === 'reports') pageContent = <ReportsPage />;
    else if (currentPage === 'admin_user' && profile?.role === 'superadmin') pageContent = <AdminUsers />;
    else if (currentPage === 'admin_agency' && profile?.role === 'superadmin') pageContent = <AdminAgencies />;
    else if (currentPage === 'admin_category' && profile?.role === 'superadmin') pageContent = <AdminCategories />;
    else if (currentPage === 'admin_logs' && profile?.role === 'superadmin') pageContent = <AdminLogsAnalytics />;
    else if (currentPage === 'admin_info' && profile?.role === 'superadmin') pageContent = <AdminSystemInfo />;
    else pageContent = <div style={{padding:'2rem'}}>Coming soon...</div>;

    // Sidebar navigation handler
    const handleSidebarClick = (page) => {
      if (page === 'logout') {
        signOut();
      } else {
        setCurrentPage(page);
      }
    };

    return (
      <>
        <OfflineHint />
        <DashboardLayout
          user={user}
          links={links}
          currentPage={currentPage}
          onNav={handleSidebarClick}
        >
          {pageContent}
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <OfflineHint />
      {page === 'login' ? (
        <Login
          onLogin={handleLogin}
          footer={
            <div className="login-footer-alt">
              <span style={{color:'#555'}}>Don&apos;t have an account?</span>{' '}
              <button type="button" className="switch-btn" onClick={()=>setPage('register')}>
                Register
              </button>
            </div>
          }
        />
      ) : (
        <Register
          onRegister={handleRegister}
          footer={
            <div className="login-footer-alt">
              <span style={{color:'#555'}}>Already have an account?</span>{' '}
              <button type="button" className="switch-btn" onClick={()=>setPage('login')}>
                Login
              </button>
            </div>
          }
        />
      )}
    </>
  );
}

export default App;
