import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle,
  Copy,
  CreditCard,
  Edit,
  FileText,
  Globe2,
  KeyRound,
  Link2,
  Plus,
  RefreshCcw,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  Truck,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsService } from '../api/services/settings.service';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { ActionDropdown } from '../components/ui/ActionDropdown';
import { useSettingsStore } from '../store/settingsStore';
import {
  EnterpriseSettings,
  PermissionAction,
  PermissionModule,
  PlatformSettings,
  RolePermissions,
  SettingsAdmin,
  SettingsAdminInput,
  SettingsRole,
  VehicleType,
  VehicleTypeInput,
} from '../types';
import { cn } from '../utils/cn';

type AdminModalState = { open: boolean; admin: SettingsAdmin | null };
type VehicleModalState = { open: boolean; vehicle: VehicleType | null };

const permissionModules: PermissionModule[] = ['Dashboard', 'Companies', 'Drivers', 'Orders', 'Notifications', 'Settings', 'Audit Logs'];
const permissionActions: PermissionAction[] = ['view', 'edit', 'delete'];
const roles: SettingsRole[] = ['Super Admin', 'Manager', 'Support'];
const contentPages = [
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'faq', label: 'FAQ' },
  { key: 'about', label: 'About Us' },
] as const;

const cloneSettings = (settings: EnterpriseSettings) => structuredClone(settings);
const isDirty = (draft: EnterpriseSettings | null, saved: EnterpriseSettings | null) =>
  !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved);

const formatDate = (date: string) => new Date(date).toLocaleString();

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-brand-500)]';

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
  </label>
);

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; description?: string }> = ({
  title,
  icon: Icon,
  children,
  description,
}) => (
  <Card className="space-y-4">
    <div>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Icon className="h-5 w-5 text-[var(--color-brand-600)]" />
        {title}
      </h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
    {children}
  </Card>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; hint?: string }> = ({
  label,
  checked,
  onChange,
  hint,
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-[var(--color-brand-100)] hover:bg-gray-50"
  >
    <span>
      <span className="block text-sm font-medium text-gray-900">{label}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </span>
    <span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-[var(--color-brand-600)]' : 'bg-gray-200')}>
      <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition', checked ? 'left-6' : 'left-1')} />
    </span>
  </button>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles =
    status === 'Active'
      ? 'bg-green-50 text-green-700 border-green-100'
      : status === 'Suspended'
        ? 'bg-red-50 text-red-700 border-red-100'
        : 'bg-yellow-50 text-yellow-700 border-yellow-100';
  return <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', styles)}>{status}</span>;
};

const ConnectionStatus: React.FC<{ connected: boolean; lastChecked: string }> = ({ connected, lastChecked }) => (
  <div className={cn('flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold', connected ? 'border-green-100 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-red-700')}>
    {connected ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {connected ? 'Connected' : 'Not Connected'}
    <span className="hidden font-normal opacity-70 sm:inline">Checked {new Date(lastChecked).toLocaleDateString()}</span>
  </div>
);

const SettingsSkeleton: React.FC = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="space-y-4">
        <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
      </Card>
    ))}
  </div>
);

const AdminModal: React.FC<{
  state: AdminModalState;
  onClose: () => void;
  onSubmit: (admin: SettingsAdminInput, id?: string) => void;
  isSaving: boolean;
}> = ({ state, onClose, onSubmit, isSaving }) => {
  const [form, setForm] = useState<SettingsAdminInput>({ name: '', email: '', password: '', role: 'Manager' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(state.admin ? { name: state.admin.name, email: state.admin.email, role: state.admin.role, status: state.admin.status } : { name: '', email: '', password: '', role: 'Manager' });
    setErrors({});
  }, [state]);

  if (!state.open) return null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Valid email is required';
    if (!state.admin && (!form.password || form.password.length < 8)) nextErrors.password = 'Password must be at least 8 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900">{state.admin ? 'Edit Admin' : 'Add Admin'}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (validate()) onSubmit(form, state.admin?.id);
          }}
        >
          <Field label="Name" error={errors.name}><input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Email" error={errors.email}><input className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          {!state.admin && <Field label="Password" error={errors.password}><input type="password" className={inputClass} value={form.password || ''} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>}
          <Field label="Role">
            <select className={inputClass} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as SettingsRole })}>
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button disabled={isSaving} className="rounded-xl bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)] disabled:opacity-70">{isSaving ? 'Saving...' : 'Save Admin'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VehicleModal: React.FC<{
  state: VehicleModalState;
  onClose: () => void;
  onSubmit: (vehicle: VehicleTypeInput, id?: string) => void;
  isSaving: boolean;
}> = ({ state, onClose, onSubmit, isSaving }) => {
  const [form, setForm] = useState<VehicleTypeInput>({ name: '', iconUrl: '', maxWeight: 0, baseFare: 0, perKmRate: 0, description: '', active: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(state.vehicle ? { ...state.vehicle } : { name: '', iconUrl: '', maxWeight: 0, baseFare: 0, perKmRate: 0, description: '', active: true });
    setErrors({});
  }, [state]);

  if (!state.open) return null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Vehicle name is required';
    if (form.maxWeight <= 0) nextErrors.maxWeight = 'Max weight must be greater than 0';
    if (form.baseFare < 0) nextErrors.baseFare = 'Base fare cannot be negative';
    if (form.perKmRate < 0) nextErrors.perKmRate = 'Per KM rate cannot be negative';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[var(--radius-card)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900">{state.vehicle ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (validate()) onSubmit(form, state.vehicle?.id);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vehicle Name" error={errors.name}><input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Vehicle Icon/Image URL"><input className={inputClass} value={form.iconUrl} onChange={(event) => setForm({ ...form, iconUrl: event.target.value })} /></Field>
            <Field label="Max Weight" error={errors.maxWeight}><input type="number" className={inputClass} value={form.maxWeight} onChange={(event) => setForm({ ...form, maxWeight: Number(event.target.value) })} /></Field>
            <Field label="Base Price" error={errors.baseFare}><input type="number" className={inputClass} value={form.baseFare} onChange={(event) => setForm({ ...form, baseFare: Number(event.target.value) })} /></Field>
            <Field label="Per KM Price" error={errors.perKmRate}><input type="number" className={inputClass} value={form.perKmRate} onChange={(event) => setForm({ ...form, perKmRate: Number(event.target.value) })} /></Field>
            <div className="flex items-end"><Toggle label="Active Status" checked={form.active} onChange={(active) => setForm({ ...form, active })} /></div>
          </div>
          <Field label="Description"><textarea className={cn(inputClass, 'min-h-24')} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button disabled={isSaving} className="rounded-xl bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)] disabled:opacity-70">{isSaving ? 'Saving...' : 'Save Vehicle'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PermissionsMatrix: React.FC<{ permissions: RolePermissions; onChange: (permissions: RolePermissions) => void }> = ({ permissions, onChange }) => {
  const toggle = (role: SettingsRole, module: PermissionModule, action: PermissionAction) => {
    const next = cloneSettings({ security: { permissions } } as EnterpriseSettings).security.permissions;
    next[role][module][action] = !next[role][module][action];
    onChange(next);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Role / Module</th>
            {permissionModules.map((module) => <th key={module} className="px-4 py-3 text-center">{module}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {roles.map((role) => (
            permissionActions.map((action, actionIndex) => (
              <tr key={`${role}-${action}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{actionIndex === 0 ? role : ''}<span className="ml-2 text-xs capitalize text-gray-500">{action}</span></td>
                {permissionModules.map((module) => (
                  <td key={module} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={permissions[role][module][action]}
                      onChange={() => toggle(role, module, action)}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)]"
                    />
                  </td>
                ))}
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const { settings: savedSettings, admins, vehicleTypes, setSettings, setAdmins, upsertAdmin, removeAdmin, setVehicleTypes, upsertVehicleType, removeVehicleType } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('platform');
  const [draft, setDraft] = useState<EnterpriseSettings | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [adminModal, setAdminModal] = useState<AdminModalState>({ open: false, admin: null });
  const [vehicleModal, setVehicleModal] = useState<VehicleModalState>({ open: false, vehicle: null });
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState(false);
  const [activeContentPage, setActiveContentPage] = useState<(typeof contentPages)[number]['key']>('terms');

  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: settingsService.getSettings });
  const adminsQuery = useQuery({ queryKey: ['settings-admins'], queryFn: settingsService.getAdmins });
  const vehiclesQuery = useQuery({ queryKey: ['vehicle-types'], queryFn: settingsService.getVehicleTypes });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
      setDraft(cloneSettings(settingsQuery.data));
    }
  }, [setSettings, settingsQuery.data]);

  useEffect(() => {
    if (adminsQuery.data) setAdmins(adminsQuery.data);
  }, [adminsQuery.data, setAdmins]);

  useEffect(() => {
    if (vehiclesQuery.data) setVehicleTypes(vehiclesQuery.data);
  }, [setVehicleTypes, vehiclesQuery.data]);

  const dirty = useMemo(() => isDirty(draft, savedSettings), [draft, savedSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: EnterpriseSettings) => settingsService.updateSettings(settings),
    onSuccess: (settings) => {
      setSettings(settings);
      setDraft(cloneSettings(settings));
      toast.success('Settings saved successfully');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const adminMutation = useMutation({
    mutationFn: ({ admin, id }: { admin: SettingsAdminInput; id?: string }) =>
      id ? settingsService.updateAdmin(id, admin) : settingsService.createAdmin(admin),
    onSuccess: (admin) => {
      upsertAdmin(admin);
      queryClient.invalidateQueries({ queryKey: ['settings-admins'] });
      setAdminModal({ open: false, admin: null });
      toast.success('Admin saved successfully');
    },
    onError: () => toast.error('Failed to save admin'),
  });

  const deleteAdminMutation = useMutation({
    mutationFn: settingsService.deleteAdmin,
    onSuccess: (_, id) => {
      removeAdmin(id);
      setDeleteAdminId(null);
      toast.success('Admin deleted');
    },
    onError: () => toast.error('Failed to delete admin'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: settingsService.resetAdminPassword,
    onSuccess: () => toast.success('Password reset link sent'),
    onError: () => toast.error('Failed to reset password'),
  });

  const vehicleMutation = useMutation({
    mutationFn: ({ vehicle, id }: { vehicle: VehicleTypeInput; id?: string }) =>
      id ? settingsService.updateVehicleType(id, vehicle) : settingsService.createVehicleType(vehicle),
    onSuccess: (vehicle) => {
      upsertVehicleType(vehicle);
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      setVehicleModal({ open: false, vehicle: null });
      toast.success('Vehicle type saved successfully');
    },
    onError: () => toast.error('Failed to save vehicle type'),
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: settingsService.deleteVehicleType,
    onSuccess: (_, id) => {
      removeVehicleType(id);
      setDeleteVehicleId(null);
      toast.success('Vehicle type deleted');
    },
    onError: () => toast.error('Failed to delete vehicle type'),
  });

  const updatePlatform = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    if (!draft) return;
    setDraft({ ...draft, platform: { ...draft.platform, [key]: value } });
  };

  const updateNested = <TSection extends keyof EnterpriseSettings>(section: TSection, value: EnterpriseSettings[TSection]) => {
    if (!draft) return;
    setDraft({ ...draft, [section]: value });
  };

  const tabs = [
    { id: 'platform', label: 'Platform Config' },
    { id: 'admin', label: 'Admin Users', count: admins.length },
    { id: 'vehicles', label: 'Vehicle Types', count: vehicleTypes.length },
    { id: 'billing', label: 'Billing' },
    { id: 'content', label: 'Content (T&C)' },
    { id: 'notifications', label: 'Notification Settings' },
    { id: 'security', label: 'Security Settings' },
    { id: 'integrations', label: 'Integrations' },
  ];

  if (settingsQuery.isLoading || !draft) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-sm text-gray-500">Manage platform configuration and preferences.</p></div>
        <SettingsSkeleton />
      </div>
    );
  }

  const saveButton = (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        onClick={() => setResetOpen(true)}
        disabled={!dirty}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCcw className="h-4 w-4" /> Reset
      </button>
      <button
        onClick={() => updateSettingsMutation.mutate(draft)}
        disabled={!dirty || updateSettingsMutation.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-4 w-4" /> {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage platform configuration, access, pricing, content, and integrations.</p>
        </div>
        {saveButton}
      </div>

      {dirty && (
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800">
          You have unsaved settings changes.
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="space-y-6">
        {activeTab === 'platform' && (
          <div className="grid gap-6 xl:grid-cols-2">
            <Section title="General Info" icon={SettingsIcon}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Platform Name"><input className={inputClass} value={draft.platform.platformName} onChange={(event) => updatePlatform('platformName', event.target.value)} /></Field>
                <Field label="Support Email"><input type="email" className={inputClass} value={draft.platform.supportEmail} onChange={(event) => updatePlatform('supportEmail', event.target.value)} /></Field>
                <Field label="Support Phone"><input className={inputClass} value={draft.platform.supportPhone} onChange={(event) => updatePlatform('supportPhone', event.target.value)} /></Field>
                <Field label="Timezone"><input className={inputClass} value={draft.platform.timezone} onChange={(event) => updatePlatform('timezone', event.target.value)} /></Field>
                <Field label="Country"><input className={inputClass} value={draft.platform.country} onChange={(event) => updatePlatform('country', event.target.value)} /></Field>
                <Field label="Default Currency"><input className={inputClass} value={draft.platform.defaultCurrency} onChange={(event) => updatePlatform('defaultCurrency', event.target.value)} /></Field>
              </div>
            </Section>

            <Section title="Branding" icon={Upload}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex h-24 w-40 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <img src={draft.platform.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 space-y-4">
                  <Field label="Upload Logo"><input className={inputClass} value={draft.platform.logoUrl} onChange={(event) => updatePlatform('logoUrl', event.target.value)} /></Field>
                  <Field label="Upload Favicon"><input className={inputClass} value={draft.platform.faviconUrl} onChange={(event) => updatePlatform('faviconUrl', event.target.value)} /></Field>
                </div>
              </div>
            </Section>

            <Section title="Platform Toggles" icon={ShieldCheck}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="Enable Registrations" checked={draft.platform.enableRegistrations} onChange={(value) => updatePlatform('enableRegistrations', value)} />
                <Toggle label="Enable Live Tracking" checked={draft.platform.enableLiveTracking} onChange={(value) => updatePlatform('enableLiveTracking', value)} />
                <Toggle label="Enable Push Notifications" checked={draft.platform.enablePushNotifications} onChange={(value) => updatePlatform('enablePushNotifications', value)} />
                <Toggle label="Enable Auto Driver Assignment" checked={draft.platform.enableAutoDriverAssignment} onChange={(value) => updatePlatform('enableAutoDriverAssignment', value)} />
                <Toggle label="Maintenance Mode" checked={draft.platform.maintenanceMode} onChange={(value) => updatePlatform('maintenanceMode', value)} />
              </div>
            </Section>

            <Section title="System Preferences" icon={Globe2}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Default Language"><input className={inputClass} value={draft.platform.defaultLanguage} onChange={(event) => updatePlatform('defaultLanguage', event.target.value)} /></Field>
                <Field label="Date Format"><input className={inputClass} value={draft.platform.dateFormat} onChange={(event) => updatePlatform('dateFormat', event.target.value)} /></Field>
                <Field label="Currency Format"><input className={inputClass} value={draft.platform.currencyFormat} onChange={(event) => updatePlatform('currencyFormat', event.target.value)} /></Field>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6">
            <Section title="Admin Users" icon={Users}>
              <div className="mb-4 flex justify-end">
                <button onClick={() => setAdminModal({ open: true, admin: null })} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)]">
                  <Plus className="h-4 w-4" /> Add Admin
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last Login</th><th className="px-4 py-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(adminsQuery.isLoading ? [] : admins).map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{admin.name}</td>
                        <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                        <td className="px-4 py-3">{admin.role}</td>
                        <td className="px-4 py-3"><StatusBadge status={admin.status} /></td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(admin.lastLogin)}</td>
                        <td className="px-4 py-3">
                          <ActionDropdown actions={[
                            { label: 'Edit Admin', icon: <Edit className="h-4 w-4" />, onClick: () => setAdminModal({ open: true, admin }) },
                            { label: admin.status === 'Suspended' ? 'Activate Admin' : 'Suspend Admin', icon: <ShieldCheck className="h-4 w-4" />, onClick: () => adminMutation.mutate({ id: admin.id, admin: { ...admin, status: admin.status === 'Suspended' ? 'Active' : 'Suspended' } }) },
                            { label: 'Reset Password', icon: <KeyRound className="h-4 w-4" />, onClick: () => resetPasswordMutation.mutate(admin.id) },
                            { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleteAdminId(admin.id), color: 'danger' },
                          ]} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
            <Section title="Role Permissions System" icon={ShieldCheck}>
              <PermissionsMatrix permissions={draft.security.permissions} onChange={(permissions) => updateNested('security', { ...draft.security, permissions })} />
            </Section>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <Section title="Vehicle Types" icon={Truck}>
            <div className="mb-4 flex justify-end">
              <button onClick={() => setVehicleModal({ open: true, vehicle: null })} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)]">
                <Plus className="h-4 w-4" /> Add Vehicle
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-[800px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr><th className="px-4 py-3">Vehicle Type</th><th className="px-4 py-3">Max Weight</th><th className="px-4 py-3">Base Fare</th><th className="px-4 py-3">Per KM Rate</th><th className="px-4 py-3">Active Status</th><th className="px-4 py-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicleTypes.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={vehicle.iconUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                          <div><p className="font-medium text-gray-900">{vehicle.name}</p><p className="text-xs text-gray-500">{vehicle.description}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{vehicle.maxWeight} kg</td>
                      <td className="px-4 py-3">${vehicle.baseFare}</td>
                      <td className="px-4 py-3">${vehicle.perKmRate}</td>
                      <td className="px-4 py-3"><StatusBadge status={vehicle.active ? 'Active' : 'Suspended'} /></td>
                      <td className="px-4 py-3">
                        <ActionDropdown actions={[
                          { label: 'Edit Vehicle', icon: <Edit className="h-4 w-4" />, onClick: () => setVehicleModal({ open: true, vehicle }) },
                          { label: vehicle.active ? 'Deactivate' : 'Activate', icon: <ShieldCheck className="h-4 w-4" />, onClick: () => vehicleMutation.mutate({ id: vehicle.id, vehicle: { ...vehicle, active: !vehicle.active } }) },
                          { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleteVehicleId(vehicle.id), color: 'danger' },
                        ]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {activeTab === 'billing' && (
          <div className="grid gap-6 xl:grid-cols-2">
            <Section title="Platform Fees" icon={CreditCard}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Platform Commission %"><input type="number" className={inputClass} value={draft.billing.platformCommission} onChange={(event) => updateNested('billing', { ...draft.billing, platformCommission: Number(event.target.value) })} /></Field>
                <Field label="Tax %"><input type="number" className={inputClass} value={draft.billing.taxPercent} onChange={(event) => updateNested('billing', { ...draft.billing, taxPercent: Number(event.target.value) })} /></Field>
                <Field label="Cancellation Fee"><input type="number" className={inputClass} value={draft.billing.cancellationFee} onChange={(event) => updateNested('billing', { ...draft.billing, cancellationFee: Number(event.target.value) })} /></Field>
                <Field label="Minimum Order Charge"><input type="number" className={inputClass} value={draft.billing.minimumOrderCharge} onChange={(event) => updateNested('billing', { ...draft.billing, minimumOrderCharge: Number(event.target.value) })} /></Field>
              </div>
            </Section>
            <Section title="Payment Settings" icon={CreditCard}>
              <div className="grid gap-3">
                <Toggle label="Cash On Delivery" checked={draft.billing.cashOnDelivery} onChange={(value) => updateNested('billing', { ...draft.billing, cashOnDelivery: value })} />
                <Toggle label="Wallet Payments" checked={draft.billing.walletPayments} onChange={(value) => updateNested('billing', { ...draft.billing, walletPayments: value })} />
                <Toggle label="Online Payments" checked={draft.billing.onlinePayments} onChange={(value) => updateNested('billing', { ...draft.billing, onlinePayments: value })} />
              </div>
            </Section>
            <Section title="Invoice Settings" icon={FileText}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Invoice Prefix"><input className={inputClass} value={draft.billing.invoicePrefix} onChange={(event) => updateNested('billing', { ...draft.billing, invoicePrefix: event.target.value })} /></Field>
                <Field label="Billing Cycle"><input className={inputClass} value={draft.billing.billingCycle} onChange={(event) => updateNested('billing', { ...draft.billing, billingCycle: event.target.value })} /></Field>
                <Field label="Currency Symbol"><input className={inputClass} value={draft.billing.currencySymbol} onChange={(event) => updateNested('billing', { ...draft.billing, currencySymbol: event.target.value })} /></Field>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <Section title="Notification Channels" icon={Bell}>
              <div className="space-y-3">
                <Toggle label="Push Notifications" checked={draft.notifications.pushNotifications} onChange={(value) => updateNested('notifications', { ...draft.notifications, pushNotifications: value })} />
                <Toggle label="Email Notifications" checked={draft.notifications.emailNotifications} onChange={(value) => updateNested('notifications', { ...draft.notifications, emailNotifications: value })} />
                <Toggle label="SMS Notifications" checked={draft.notifications.smsNotifications} onChange={(value) => updateNested('notifications', { ...draft.notifications, smsNotifications: value })} />
              </div>
            </Section>
            <Section title="Template Management" icon={FileText}>
              <div className="grid gap-4 lg:grid-cols-2">
                {draft.notifications.templates.map((template) => (
                  <div key={template.id} className="rounded-xl border border-gray-100 p-4">
                    <p className="mb-3 font-semibold text-gray-900">{template.name}</p>
                    <Field label="Subject"><input className={inputClass} value={template.subject} onChange={(event) => {
                      const templates = draft.notifications.templates.map((item) => item.id === template.id ? { ...item, subject: event.target.value } : item);
                      updateNested('notifications', { ...draft.notifications, templates });
                    }} /></Field>
                    <Field label="Body"><textarea className={cn(inputClass, 'mt-3 min-h-24')} value={template.body} onChange={(event) => {
                      const templates = draft.notifications.templates.map((item) => item.id === template.id ? { ...item, body: event.target.value } : item);
                      updateNested('notifications', { ...draft.notifications, templates });
                    }} /></Field>
                    <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                      <p className="font-semibold text-gray-900">Preview</p>
                      <p>{template.subject}</p>
                      <p className="mt-1">{template.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <Section title="Security Configuration" icon={KeyRound}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Session Timeout"><input type="number" className={inputClass} value={draft.security.sessionTimeout} onChange={(event) => updateNested('security', { ...draft.security, sessionTimeout: Number(event.target.value) })} /></Field>
                  <Field label="Password Minimum Length"><input type="number" className={inputClass} value={draft.security.passwordMinimumLength} onChange={(event) => updateNested('security', { ...draft.security, passwordMinimumLength: Number(event.target.value) })} /></Field>
                  <Field label="Login Attempt Limit"><input type="number" className={inputClass} value={draft.security.loginAttemptLimit} onChange={(event) => updateNested('security', { ...draft.security, loginAttemptLimit: Number(event.target.value) })} /></Field>
                </div>
              </Section>
              <Section title="Access Control" icon={ShieldCheck}>
                <div className="grid gap-3">
                  <Toggle label="Two Factor Authentication" checked={draft.security.twoFactorAuthentication} onChange={(value) => updateNested('security', { ...draft.security, twoFactorAuthentication: value })} />
                  <Toggle label="Device Verification" checked={draft.security.deviceVerification} onChange={(value) => updateNested('security', { ...draft.security, deviceVerification: value })} />
                  <Toggle label="Force Password Reset" checked={draft.security.forcePasswordReset} onChange={(value) => updateNested('security', { ...draft.security, forcePasswordReset: value })} />
                </div>
              </Section>
            </div>
            <Section title="Role-Based Access Matrix" icon={ShieldCheck}>
              <PermissionsMatrix permissions={draft.security.permissions} onChange={(permissions) => updateNested('security', { ...draft.security, permissions })} />
            </Section>
          </div>
        )}

        {activeTab === 'content' && (
          <Section title="Content Management" icon={FileText}>
            <div className="flex flex-wrap gap-2">
              {contentPages.map((page) => (
                <button key={page.key} onClick={() => setActiveContentPage(page.key)} className={cn('rounded-xl px-3 py-2 text-sm font-medium transition', activeContentPage === page.key ? 'bg-[var(--color-brand-600)] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>
                  {page.label}
                </button>
              ))}
              <button onClick={() => setContentPreview((value) => !value)} className="ml-auto rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {contentPreview ? 'Edit Mode' : 'Preview Mode'}
              </button>
            </div>
            {contentPreview ? (
              <div className="min-h-72 whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-5 text-sm leading-6 text-gray-700">{draft.content[activeContentPage]}</div>
            ) : (
              <textarea className={cn(inputClass, 'min-h-72')} value={draft.content[activeContentPage]} onChange={(event) => updateNested('content', { ...draft.content, [activeContentPage]: event.target.value })} />
            )}
          </Section>
        )}

        {activeTab === 'integrations' && (
          <div className="grid gap-6 xl:grid-cols-2">
            <Section title="External Integrations" icon={Link2}>
              <div className="space-y-4">
                <Field label="Google Maps API Key"><input className={inputClass} value={draft.integrations.googleMapsApiKey} onChange={(event) => updateNested('integrations', { ...draft.integrations, googleMapsApiKey: event.target.value })} /></Field>
                <Field label="Firebase Config"><textarea className={cn(inputClass, 'min-h-24')} value={draft.integrations.firebaseConfig} onChange={(event) => updateNested('integrations', { ...draft.integrations, firebaseConfig: event.target.value })} /></Field>
                <Field label="Stripe Publishable Key"><input className={inputClass} value={draft.integrations.stripePublishableKey} onChange={(event) => updateNested('integrations', { ...draft.integrations, stripePublishableKey: event.target.value })} /></Field>
                <Field label="Stripe Secret Key"><input className={inputClass} value={draft.integrations.stripeSecretKey} onChange={(event) => updateNested('integrations', { ...draft.integrations, stripeSecretKey: event.target.value })} /></Field>
                <Field label="Email Provider Config"><input className={inputClass} value={draft.integrations.emailProvider} onChange={(event) => updateNested('integrations', { ...draft.integrations, emailProvider: event.target.value })} /></Field>
                <Field label="Email API Key"><input className={inputClass} value={draft.integrations.emailApiKey} onChange={(event) => updateNested('integrations', { ...draft.integrations, emailApiKey: event.target.value })} /></Field>
              </div>
            </Section>
            <Section title="Connection Status" icon={CheckCircle}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4"><span className="font-medium text-gray-900">Google Maps</span><ConnectionStatus {...draft.integrations.statuses.googleMaps} /></div>
                <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4"><span className="font-medium text-gray-900">Firebase</span><ConnectionStatus {...draft.integrations.statuses.firebase} /></div>
                <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4"><span className="font-medium text-gray-900">Email Service</span><ConnectionStatus {...draft.integrations.statuses.emailService} /></div>
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Copy className="h-4 w-4" /> Copy Config Summary
                </button>
              </div>
            </Section>
          </div>
        )}
      </div>

      <AdminModal state={adminModal} onClose={() => setAdminModal({ open: false, admin: null })} onSubmit={(admin, id) => adminMutation.mutate({ admin, id })} isSaving={adminMutation.isPending} />
      <VehicleModal state={vehicleModal} onClose={() => setVehicleModal({ open: false, vehicle: null })} onSubmit={(vehicle, id) => vehicleMutation.mutate({ vehicle, id })} isSaving={vehicleMutation.isPending} />

      <ConfirmModal
        isOpen={resetOpen}
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          if (savedSettings) setDraft(cloneSettings(savedSettings));
          setResetOpen(false);
          toast.success('Unsaved changes reset');
        }}
        title="Reset Changes"
        message="Reset all unsaved settings changes back to the last saved configuration?"
        confirmLabel="Reset"
        variant="warning"
      />
      <ConfirmModal
        isOpen={!!deleteAdminId}
        onCancel={() => setDeleteAdminId(null)}
        onConfirm={() => deleteAdminId && deleteAdminMutation.mutate(deleteAdminId)}
        title="Delete Admin"
        message="Delete this admin account? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
      <ConfirmModal
        isOpen={!!deleteVehicleId}
        onCancel={() => setDeleteVehicleId(null)}
        onConfirm={() => deleteVehicleId && deleteVehicleMutation.mutate(deleteVehicleId)}
        title="Delete Vehicle Type"
        message="Delete this vehicle type from pricing configuration?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
