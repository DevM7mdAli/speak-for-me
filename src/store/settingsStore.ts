import { create } from 'zustand';

import i18n from '@/i18n';
import { DEFAULT_SETTINGS, type AppSettings } from '@/data/models';
import { settingsRepository } from '@/data/repositories';

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  hydrate: () => Promise<AppSettings>;
  update: (patch: Partial<AppSettings>) => Promise<AppSettings>;
  reset: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,

  hydrate: async () => {
    const settings = await settingsRepository.get();
    if (i18n.language !== settings.language) {
      await i18n.changeLanguage(settings.language);
    }
    set({ settings, hydrated: true });
    return settings;
  },

  update: async (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await settingsRepository.save(settings);
    if (patch.language && i18n.language !== patch.language) {
      await i18n.changeLanguage(patch.language);
    }
    return settings;
  },

  reset: async () => {
    await settingsRepository.reset();
    const settings = await settingsRepository.get();
    set({ settings });
    await i18n.changeLanguage(settings.language);
  },
}));
