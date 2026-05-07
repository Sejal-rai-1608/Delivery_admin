import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { auditService } from '../../api/services/audit.service';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Sidebar: React.FC<{ isOpen: boolean; close: () => void }> = ({ isOpen, close }) => {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (user) {
      void auditService.createAuditLog({
        actor: user.name,
        actorRole: user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Manager',
        action: 'Logout',
        resourceType: 'System',
        resourceId: 'auth-session',
        resourceName: 'Admin authentication',
        severity: 'Info',
        status: 'Success',
        details: `${user.name} signed out of the admin console.`,
        before: { sessionStatus: 'ACTIVE' },
        after: { sessionStatus: 'ENDED' },
        metadata: {
          browser: 'Chrome 136',
          device: 'Windows laptop',
          ipAddress: '203.0.113.24',
          sessionId: `sess-${Date.now().toString(36)}`,
        },
        searchTags: [user.email, user.name, 'logout'],
      }).catch(() => undefined);
    }
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/companies', icon: Building2, label: 'Companies' },
    { to: '/drivers', icon: Users, label: 'Drivers' },
    { to: '/orders', icon: Package, label: 'Orders' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/audit-logs', icon: ShieldAlert, label: 'Audit Logs' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
      />
      
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-[var(--color-sidebar-from)] to-[var(--color-sidebar-to)] text-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shrink-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
               <Package className="w-5 h-5 text-white" />
             </div>
             LogiX Admin
          </div>
          <button onClick={close} className="lg:hidden p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-medium",
                isActive 
                  ? "bg-white/15 text-white shadow-sm" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-all font-medium"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const user = useAuthStore(state => state.user);
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-200)] flex items-center justify-center text-[var(--color-brand-600)] font-bold shadow-sm border border-[var(--color-brand-50)]">
          {user?.name?.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
};

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
