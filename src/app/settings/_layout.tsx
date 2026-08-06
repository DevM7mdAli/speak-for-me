import { createContext, useContext, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSettings } from '@/hooks/useSettings';
import { useSettingsStore } from '@/store/settingsStore';

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `speak-for-me:${pin}`);
}

interface SettingsGate {
  /** Re-locks the gate and starts the create-PIN flow (used by "Change PIN"). */
  restartPinSetup: () => void;
}

const GateContext = createContext<SettingsGate>({ restartPinSetup: () => {} });
export const useSettingsGate = () => useContext(GateContext);

type Stage = 'enter' | 'create' | 'confirm';

/**
 * Everything under /settings sits behind a 4-digit caregiver PIN.
 * First visit creates the PIN (enter twice); later visits verify it.
 */
export default function SettingsLayout() {
  const { t } = useTranslation();
  const settings = useSettings();
  const update = useSettingsStore((s) => s.update);

  const [unlocked, setUnlocked] = useState(false);
  const [stage, setStage] = useState<Stage>(settings.caregiverPinHash ? 'enter' : 'create');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string>();

  const handleComplete = async (pin: string) => {
    setError(undefined);
    if (stage === 'enter') {
      if ((await hashPin(pin)) === settings.caregiverPinHash) {
        setUnlocked(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(t('pin.wrong'));
      }
    } else if (stage === 'create') {
      setFirstPin(pin);
      setStage('confirm');
    } else {
      if (pin === firstPin) {
        await update({ caregiverPinHash: await hashPin(pin) });
        setUnlocked(true);
        setStage('enter');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(t('pin.mismatch'));
        setStage('create');
      }
      setFirstPin('');
    }
  };

  if (!unlocked) {
    const prompt =
      stage === 'enter' ? t('pin.enter') : stage === 'create' ? t('pin.create') : t('pin.confirm');
    return (
      <Screen>
        <ScreenHeader title={t('pin.title')} />
        <View className="flex-1 justify-center p-4">
          <PinPad prompt={prompt} error={error} onComplete={handleComplete} />
        </View>
      </Screen>
    );
  }

  return (
    <GateContext.Provider
      value={{
        restartPinSetup: () => {
          setUnlocked(false);
          setStage('create');
          setError(undefined);
        },
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </GateContext.Provider>
  );
}
