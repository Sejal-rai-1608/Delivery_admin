import { create } from 'zustand';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface FiltersState {
  dateRange: DateRange;
  companyId: string | null;
  driverId: string | null;
  searchQuery: string;
  setDateRange: (range: DateRange) => void;
  setCompanyId: (id: string | null) => void;
  setDriverId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  dateRange: { startDate: null, endDate: null },
  companyId: null,
  driverId: null,
  searchQuery: '',
  setDateRange: (dateRange) => set({ dateRange }),
  setCompanyId: (companyId) => set({ companyId }),
  setDriverId: (driverId) => set({ driverId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  resetFilters: () => set({
    dateRange: { startDate: null, endDate: null },
    companyId: null,
    driverId: null,
    searchQuery: '',
  }),
}));
