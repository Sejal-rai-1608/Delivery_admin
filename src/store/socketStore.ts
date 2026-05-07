import { create } from 'zustand';

export interface DriverLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'on_delivery';
}

interface SocketState {
  driverLocations: Record<string, DriverLocation>;
  liveUpdates: string[]; // generic updates log
  setInitialDrivers: (drivers: DriverLocation[]) => void;
  updateDriverLocation: (driverId: string, lat: number, lng: number) => void;
  addLiveUpdate: (update: string) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  driverLocations: {},
  liveUpdates: [],
  setInitialDrivers: (drivers) => 
    set(() => {
      const locations: Record<string, DriverLocation> = {};
      drivers.forEach(d => {
        locations[d.id] = d;
      });
      return { driverLocations: locations };
    }),
  updateDriverLocation: (driverId, lat, lng) => 
    set((state) => {
      const driver = state.driverLocations[driverId];
      if (!driver) return state;
      return {
        driverLocations: {
          ...state.driverLocations,
          [driverId]: { ...driver, lat, lng },
        },
      };
    }),
  addLiveUpdate: (update) =>
    set((state) => ({
      liveUpdates: [update, ...state.liveUpdates].slice(0, 50), // keep last 50
    })),
}));
