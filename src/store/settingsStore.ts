import { create } from 'zustand';
import { EnterpriseSettings, SettingsAdmin, VehicleType } from '../types';

interface SettingsState {
  settings: EnterpriseSettings | null;
  admins: SettingsAdmin[];
  vehicleTypes: VehicleType[];
  setSettings: (settings: EnterpriseSettings) => void;
  setAdmins: (admins: SettingsAdmin[]) => void;
  upsertAdmin: (admin: SettingsAdmin) => void;
  removeAdmin: (id: string) => void;
  setVehicleTypes: (vehicleTypes: VehicleType[]) => void;
  upsertVehicleType: (vehicleType: VehicleType) => void;
  removeVehicleType: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: null,
  admins: [],
  vehicleTypes: [],
  setSettings: (settings) => set({ settings }),
  setAdmins: (admins) => set({ admins }),
  upsertAdmin: (admin) =>
    set((state) => ({
      admins: [admin, ...state.admins.filter((item) => item.id !== admin.id)],
    })),
  removeAdmin: (id) => set((state) => ({ admins: state.admins.filter((admin) => admin.id !== id) })),
  setVehicleTypes: (vehicleTypes) => set({ vehicleTypes }),
  upsertVehicleType: (vehicleType) =>
    set((state) => ({
      vehicleTypes: [vehicleType, ...state.vehicleTypes.filter((item) => item.id !== vehicleType.id)],
    })),
  removeVehicleType: (id) =>
    set((state) => ({ vehicleTypes: state.vehicleTypes.filter((vehicleType) => vehicleType.id !== id) })),
}));
