


import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import { useAuthSession, signOut } from './useAuthSession';
import { useUserProfile, upsertUserProfile } from './useUserProfile';
import { handleOAuthCallback } from './utils/authUtils';

import UserManagement from './UserManagement';
import DashboardLayout from './DashboardLayout';

import DashboardHome from './components/DashboardHome';
import ReportsPage from './components/ReportsPage';
import EnhancedReportsPage from './components/EnhancedReportsPage';
import CitizenDashboard from './components/CitizenDashboard';
import AgencyDashboard from './components/AgencyDashboard';
import MyReports from './components/MyReports';
import EmergencyTips from './components/EmergencyTips';
import ProfileTest from './components/ProfileTest';
import {
  AdminUsers,
  AdminAgencies,
  AdminCategories,
  AdminLogsAnalytics,
  AdminSystemInfo
} from './components/AdminPanel';
import EnhancedUsersManagement from './components/EnhancedUsersManagement';
import AdvancedAnalyticsLogs from './components/AdvancedAnalyticsLogs';
import SystemInfoManagement from './components/SystemInfoManagement';
import DatabaseStructureCheck from './components/DatabaseStructureCheck';

import OfflineHint from './components/OfflineHint';
import DatabaseDebug from './components/DatabaseDebug';
import SupabaseDebug from './components/SupabaseDebug';



function App() {
  const [page, setPage] = useState('debug'); // Changed to debug temporarily
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const { user, loading } = useAuthSession();
  // Always call the hook, even if user is null
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user?.id);

  // Handle OAuth callback on app initialization
  useEffect(() => {
    const oauthResult = handleOAuthCallback();
    if (oauthResult) {
      // OAuth callback detected, the auth session hook will handle the rest
      console.log('OAuth callback detected');
    }
  }, []);

  const handleLogin = () => setPage('dashboard');
  const handleRegister = () => setPage('dashboard');

  // Handle creating a default profile if user exists but no profile found
  const handleCreateDefaultProfile = async () => {
    if (!user) return;
    setIsCreatingProfile(true);
    try {
      console.log('Creating profile for user:', { id: user.id, email: user.email });
      
      const { data, error } = await upsertUserProfile({
        id: user.id,
        email: user.email,
        role: 'citizen',
        agency_id: null,
      });
      
      console.log('Profile creation result:', { data, error });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Profile created successfully, reloading page...');
      // Force a reload to get the new profile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating profile:', error);
      alert(`Failed to create profile: ${error.message || 'Unknown error'}. Please try again or contact support.`);
      setIsCreatingProfile(false);
    }
  };

  if (loading) return <div style={{textAlign:'center',marginTop:'3rem'}}><OfflineHint />Loading...</div>;

  if (user) {
    if (profileLoading) return <div style={{textAlign:'center',marginTop:'3rem'}}><OfflineHint />Loading profile...</div>;
    
    // If there's a profile error (not just missing profile)
    if (profileError) {
      return (
        <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>
          <OfflineHint />
          <div>Error loading profile: {profileError.message || 'Unknown error.'}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{marginTop:'1rem', padding:'0.5rem 1rem', backgroundColor:'#007bff', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
          >
            Retry
          </button>
        </div>
      );
    }
    
    // If user exists but no profile found, offer to create one
    if (!profile && !profileLoading && !profileError) {
      return (
        <div style={{textAlign:'center',marginTop:'3rem'}}>
          <OfflineHint />
          <div>Welcome! It looks like this is your first time using the system.</div>
          <div style={{marginTop:'1rem'}}>We need to set up your profile.</div>
          <button 
            onClick={handleCreateDefaultProfile}
            disabled={isCreatingProfile}
            style={{
              marginTop:'1rem', 
              padding:'0.5rem 1rem', 
              backgroundColor: isCreatingProfile ? '#6c757d' : '#28a745', 
              color:'white', 
              border:'none', 
              borderRadius:'4px', 
              cursor: isCreatingProfile ? 'not-allowed' : 'pointer'
            }}
          >
            {isCreatingProfile ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>
      );
    }
    // Sidebar links and page routing
    let links = [];
    
    // Role-based navigation
    if (profile?.role === 'citizen' || !profile?.role) {
      links = [
        { label: 'Dashboard', page: 'dashboard', icon: 'fa fa-home' },
        { label: 'My Reports', page: 'myreports', icon: 'fa fa-clipboard-list' },
        { label: 'Emergency Tips', page: 'tips', icon: 'fa fa-lightbulb' },
        { label: 'Emergency Hotlines', page: 'hotlines', icon: 'fa fa-phone' },
      ];
    } else if (profile?.role === 'agency') {
      // Agency users get agency-specific navigation
      links = [
        { label: 'Agency Dashboard', page: 'agency_dashboard', icon: 'fa fa-home' },
        { label: 'Assigned Reports', page: 'reports', icon: 'fa fa-clipboard-list' },
        { label: 'Equipment Guide', page: 'equipment', icon: 'fa fa-tools' },
      ];
    } else if (profile?.role === 'admin') {
      // Municipal Admin navigation
      links = [
        { label: 'Dashboard', page: 'dashboard', icon: 'fa fa-home' },
        { label: 'Reports Management', page: 'reports', icon: 'fa fa-clipboard-list' },
        { label: 'Agency Management', page: 'agencies', icon: 'fa fa-building' },
        { label: 'Category Management', page: 'categories', icon: 'fa fa-list' },
        { label: 'Analytics', page: 'analytics', icon: 'fa fa-chart-bar' },
      ];
    } else {
      // Default for other admin types
      links = [
        { label: 'Dashboard', page: 'dashboard', icon: 'fa fa-home' },
        { label: 'Reports', page: 'reports', icon: 'fa fa-clipboard-list' },
      ];
    }
    
    if (profile?.role === 'superadmin') {
      links.push({ label: 'Users Management', page: 'admin_user', icon: 'fa fa-users-cog' });
      links.push({ label: 'Agencies', page: 'admin_agency', icon: 'fa fa-building' });
      links.push({ label: 'Categories', page: 'admin_category', icon: 'fa fa-list' });
      links.push({ label: 'Advanced Analytics', page: 'admin_logs', icon: 'fa fa-chart-bar' });
      links.push({ label: 'System Management', page: 'admin_info', icon: 'fa fa-info-circle' });
      links.push({ label: 'Database Check', page: 'db_check', icon: 'fa fa-database' });
      links.push({ label: 'Profile Test', page: 'profile_test', icon: 'fa fa-user-check' });
    }
    
    links.push({ label: 'Logout', page: 'logout', icon: 'fa fa-sign-out-alt' });

    // Render page content based on role and current page
    let pageContent = null;
    
    if (profile?.role === 'citizen' || !profile?.role) {
      // Citizen-specific pages
      if (currentPage === 'dashboard') pageContent = <CitizenDashboard user={user} />;
      else if (currentPage === 'myreports') pageContent = <MyReports user={user} />;
      else if (currentPage === 'tips') pageContent = <EmergencyTips />;
      else pageContent = <CitizenDashboard user={user} />; // Default to citizen dashboard
    } else if (profile?.role === 'agency') {
      // Agency-specific pages
      if (currentPage === 'agency_dashboard') pageContent = <AgencyDashboard user={user} />;
      else if (currentPage === 'reports') pageContent = <EnhancedReportsPage user={user} />;
      else if (currentPage === 'equipment') pageContent = <div style={{padding:'2rem'}}>Equipment Guide coming soon...</div>;
      else pageContent = <AgencyDashboard user={user} />; // Default to agency dashboard
    } else if (profile?.role === 'admin') {
      // Municipal Admin pages
      if (currentPage === 'dashboard') pageContent = <DashboardHome />;
      else if (currentPage === 'reports') pageContent = <EnhancedReportsPage user={user} />;
      else if (currentPage === 'agencies') pageContent = <AdminAgencies />;
      else if (currentPage === 'categories') pageContent = <AdminCategories />;
      else if (currentPage === 'analytics') pageContent = <AdvancedAnalyticsLogs />;
      else pageContent = <DashboardHome />; // Default to admin dashboard
    } else {
      // SuperAdmin and other admin pages
      if (currentPage === 'dashboard') pageContent = <DashboardHome />;
      else if (currentPage === 'reports') pageContent = <EnhancedReportsPage user={user} />;
      else if (currentPage === 'admin_user' && profile?.role === 'superadmin') pageContent = <EnhancedUsersManagement />;
      else if (currentPage === 'admin_agency' && profile?.role === 'superadmin') pageContent = <AdminAgencies />;
      else if (currentPage === 'admin_category' && profile?.role === 'superadmin') pageContent = <AdminCategories />;
      else if (currentPage === 'admin_logs' && profile?.role === 'superadmin') pageContent = <AdvancedAnalyticsLogs />;
      else if (currentPage === 'admin_info' && profile?.role === 'superadmin') pageContent = <SystemInfoManagement />;
      else if (currentPage === 'db_check' && profile?.role === 'superadmin') pageContent = <DatabaseStructureCheck />;
      else if (currentPage === 'profile_test' && profile?.role === 'superadmin') pageContent = <ProfileTest />;
      else pageContent = <DashboardHome />; // Default
    }

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
      {page === 'debug' ? (
        <div>
          <SupabaseDebug />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => setPage('login')}>Go to Login</button>
          </div>
        </div>
      ) : page === 'login' ? (
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
      <DatabaseDebug />
    </>
  );
}

export default App;
