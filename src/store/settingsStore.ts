import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type Density = 'comfortable' | 'compact';

interface SettingsState {
  theme: Theme;
  density: Density;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const applyDomSettings = (theme: Theme, density: Density) => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-density', density);
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      density: 'comfortable',
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setTheme: (theme) => {
        applyDomSettings(theme, get().density);
        set({ theme });
      },
      setDensity: (density) => {
        applyDomSettings(get().theme, density);
        set({ density });
      },
    }),
    {
      name: 'app-settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDomSettings(state.theme, state.density);
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

// Initial application on load for the very first time
const initialState = useSettingsStore.getState();
applyDomSettings(initialState.theme, initialState.density);
