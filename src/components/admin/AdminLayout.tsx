import React, { ReactNode } from 'react';
import { ResponsiveNavigation } from './ResponsiveNavigation';

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
  return (
    <ResponsiveNavigation
      activeTab={activeTab}
      onTabChange={onTabChange}
      onLogout={onLogout}
    >
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
        {children}
      </div>
    </ResponsiveNavigation>
  );
};