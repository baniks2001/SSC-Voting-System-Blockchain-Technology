import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Vote, 
  Monitor, 
  Menu, 
  X,
  LogOut,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui';

interface ResponsiveNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children?: React.ReactNode;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({ 
  activeTab, 
  onTabChange,
  onLogout,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const getNavItems = () => {
    if (!user) return [];
    
    const userRole = user.role || user.type;

    // Poll Monitor: ONLY Poll Monitor tab
    if (userRole === 'poll_monitor') {
      return [
        { id: 'monitor', label: 'Monitor', icon: Monitor }
      ];
    }

    // Auditor: ONLY Dashboard tab
    if (userRole === 'auditor') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ];
    }

    // Admin: Dashboard, Add Candidates, Add Voters, Poll Monitor
    if (userRole === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'Candidates', icon: Vote },
        { id: 'voters', label: 'Voters', icon: Users },
        { id: 'monitor', label: 'Monitor', icon: Monitor }
      ];
    }

    // Super Admin: Everything including Add Admin
    if (userRole === 'super_admin' || userRole === 'super_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admins', label: 'Admins', icon: UserPlus },
        { id: 'candidates', label: 'Candidates', icon: Vote },
        { id: 'voters', label: 'Voters', icon: Users },
        { id: 'monitor', label: 'Monitor', icon: Monitor }
      ];
    }

    // Default fallback
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];
  };

  const navItems = getNavItems();

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Desktop Top Navigation */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <img src="../../src/assets/logo.png" alt="Logo" className="w-6 h-6 rounded" />
                </div>
                <span className="text-xl font-bold text-gray-900">{getPanelTitle()}</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105",
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md"
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideIn 0.3s ease-out forwards',
                      opacity: 0
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {activeTab === item.id && (
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right side - User */}
            <div className="flex items-center space-x-4">
              {/* User Info Display */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {getRoleDisplay()}
                  </p>
                </div>
                <Avatar className="w-8 h-8 bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </Avatar>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-button p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <img src="../../src/assets/logo.png" alt="Logo" className="w-4 h-4 rounded" />
              </div>
              <span className="text-sm font-bold text-gray-900">{getPanelTitle()}</span>
            </div>

            {/* Mobile User Avatar */}
            <Avatar className="w-8 h-8 bg-blue-100">
              <span className="text-sm font-medium text-blue-600">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </Avatar>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden mobile-menu">
            <div className="px-4 py-3 space-y-1 border-b border-gray-200">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                    // Close mobile menu after navigation
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="w-10 h-10 bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{getRoleDisplay()}</p>
                </div>
              </div>
              {isViewOnly() && (
                <div className="flex items-center text-xs text-blue-600 mb-3">
                  <Eye className="w-3 h-3 mr-1" />
                  View Only Access
                </div>
              )}
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 transform hover:scale-105",
                activeTab === item.id
                  ? "text-blue-600 bg-gradient-to-t from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'slideUp 0.3s ease-out forwards',
                opacity: 0
              }}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
              {activeTab === item.id && (
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-1 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
