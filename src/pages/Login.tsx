import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/services/auth.service';
import { auditService } from '../api/services/audit.service';
import { Truck, Lock, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@logix.com');
  const [password, setPassword] = useState('password123');
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: () => authService.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      void auditService.createAuditLog({
        actor: data.user.name,
        actorRole: data.user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Manager',
        action: 'Login',
        resourceType: 'System',
        resourceId: 'auth-session',
        resourceName: 'Admin authentication',
        severity: 'Info',
        status: 'Success',
        details: `${data.user.name} signed in to the admin console.`,
        before: { sessionStatus: 'SIGNED_OUT' },
        after: { sessionStatus: 'ACTIVE' },
        metadata: {
          browser: 'Chrome 136',
          device: 'Windows laptop',
          ipAddress: '203.0.113.24',
          sessionId: `sess-${Date.now().toString(36)}`,
        },
        searchTags: [data.user.email, data.user.name, 'login'],
      }).catch(() => undefined);
      toast.success('Successfully logged in!');
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-sidebar-from)] to-[var(--color-sidebar-to)] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Truck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          LogiX Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage the logistics platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent block w-full pl-10 sm:text-sm border-gray-300 rounded-xl p-3 bg-gray-50"
                  placeholder="admin@logix.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent block w-full pl-10 sm:text-sm border-gray-300 rounded-xl p-3 bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)]">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[var(--color-sidebar-from)] to-[var(--color-sidebar-to)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-500)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
