import React, { useState, ReactNode, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Vote, 
  Monitor, 
  Menu, 
  X,
  LogOut,
  Eye,
  ChevronDown,
  
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const { user } = useAuth();

  const getNavItems = () => {
    if (!user) return [];
    
    const userRole = user.role || user.type;
    
    console.log('🛡️ User Role:', userRole, 'Building navigation...');

    // Poll Monitor: ONLY Poll Monitor tab
    if (userRole === 'poll_monitor') {
      console.log('🔒 Poll Monitor detected - showing only Poll Monitor tab');
      return [
        { id: 'monitor', label: 'Poll Monitor', icon: Monitor }
      ];
    }

    // Auditor: ONLY Dashboard tab
    if (userRole === 'auditor') {
      console.log('🔒 Auditor detected - showing only Dashboard tab');
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ];
    }

    // Admin: Dashboard, Add Candidates, Add Voters, Poll Monitor
    if (userRole === 'admin') {
      console.log('🔒 Admin detected - showing Dashboard, Candidates, Voters, Poll Monitor');
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'Candidates', icon: Vote },
        { id: 'voters', label: 'Voters', icon: Users },
        { id: 'monitor', label: 'Poll Monitor', icon: Monitor }
      ];
    }

    // Super Admin: Everything including Add Admin
    if (userRole === 'super_admin' || userRole === 'super_admin') {
      console.log('🔓 Super Admin detected - showing all tabs');
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admins', label: 'Admins', icon: UserPlus },
        { id: 'candidates', label: 'Candidates', icon: Vote },
        { id: 'voters', label: 'Voters', icon: Users },
        { id: 'monitor', label: 'Poll Monitor', icon: Monitor }
      ];
    }

    // Default fallback (should not happen)
    console.warn('⚠️ Unknown role:', userRole);
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];
  };

  const navItems = getNavItems();

  // Ensure users stay on their allowed tabs
  useEffect(() => {
    if (user && navItems.length > 0) {
      const currentTabIsAllowed = navItems.some(item => item.id === activeTab);
      if (!currentTabIsAllowed) {
        console.log('🔄 Redirecting to allowed tab:', navItems[0].id);
        onTabChange(navItems[0].id);
      }
    }
  }, [user, navItems, activeTab, onTabChange]);

  const getPanelTitle = () => {
    if (!user) return 'Admin Panel';
    
    const userRole = user.role || user.type;
    
    if (userRole === 'poll_monitor') return 'Poll Monitor';
    if (userRole === 'auditor') return 'Auditor Dashboard';
    if (userRole === 'admin') return 'Admin Panel';
    if (userRole === 'super_admin' || userRole === 'super_admin') return 'Super Admin Panel';
    
    return 'Admin Panel';
  };

  const getRoleDisplay = () => {
    if (!user) return 'Loading...';
    
    const userRole = user.role || user.type;
    
    if (userRole === 'poll_monitor') return 'Poll Monitor';
    if (userRole === 'auditor') return 'Auditor';
    if (userRole === 'admin') return 'Admin';
    if (userRole === 'super_admin' || userRole === 'super_admin') return 'Super Admin';
    
    return userRole || 'User';
  };

  const isViewOnly = () => {
    if (!user) return false;
    
    const userRole = user.role || user.type;
    return userRole === 'poll_monitor' || userRole === 'auditor';
  };

  const getRoleBadgeColor = () => {
    if (!user) return 'bg-gray-100 text-gray-800';
    
    const userRole = user.role || user.type;
    
    switch (userRole) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'auditor': return 'bg-yellow-100 text-yellow-800';
      case 'poll_monitor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar w-64 ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <img src="../../src/assets/logo.png" alt="Logo" className="w-10 h-10 rounded-full fit-content" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {getPanelTitle()}
              </h1>
              {isViewOnly() && (
                <span className="text-xs text-blue-600 font-medium flex items-center mt-0.5">
                  <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                  View Only Access
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden action-btn action-btn-secondary p-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`nav-item w-full text-left ${
                activeTab === item.id ? 'nav-item-active' : ''
              }`}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">{item.label}</span>
              {isViewOnly() && activeTab !== item.id && (
                <span className="ml-auto text-xs text-blue-600 flex-shrink-0">View</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {getRoleDisplay()}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="nav-item w-full text-left text-red-600 hover:bg-red-50 flex items-center"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-sm sm:text-base">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex-1 min-h-screen">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="action-btn action-btn-secondary p-1 sm:p-2"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {getPanelTitle()}
                </h1>
                {isViewOnly() && (
                  <span className="text-xs text-blue-600 font-medium flex items-center mt-0.5">
                    <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                    View Only Access
                  </span>
                )}
              </div>
            </div>

            {/* Mobile User Menu */}
            <div className="relative">
              <button
                onClick={() => setMobileUserMenuOpen(!mobileUserMenuOpen)}
                className="flex items-center space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {mobileUserMenuOpen && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.fullName || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {getRoleDisplay()}
                    </p>
                    {isViewOnly() && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        View Only
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          {navItems.length > 1 && (
            <div className="px-3 pb-2 sm:px-4 sm:pb-3">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPanelTitle()}
              </h1>
              {isViewOnly() && (
                <span className="text-sm text-blue-600 font-medium flex items-center mt-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View Only Access
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                {getRoleDisplay()}
              </span>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user?.email}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>

      {/* Close mobile menus when clicking outside */}
      {(sidebarOpen || mobileUserMenuOpen) && (
        <div 
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => {
            setSidebarOpen(false);
            setMobileUserMenuOpen(false);
          }}
        />
      )}
    </div>
  );
};