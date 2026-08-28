import { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useSettings } from '@/hooks/useSettings';
import {
  emptyLockout,
  lockoutRemainingMs,
  registerFailure,
  type PinLockout,
} from '@/security/pinLockout';
import { useSettingsStore } from '@/store/settingsStore';

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `speak-for-me:${pin}`);
}

interface SettingsGate {
  /** Re-locks the gate and starts the change-PIN flow. */
  restartPinSetup: () => void;
}

const GateContext = createContext<SettingsGate>({ restartPinSetup: () => {} });
export const useSettingsGate = () => useContext(GateContext);

/**
 * `verify` — prove the existing PIN to get in.
 * `create` / `confirm` — set a new one, entered twice.
 *
 * Changing an existing PIN starts at `verify`, so walking away mid-change
 * cannot leave the app on a screen where anyone present can set a new PIN
 * and lock the real caregiver out.
 */
type Stage = 'verify' | 'create' | 'confirm';

export default function SettingsLayout() {
  const { t } = useTranslation();
  const settings = useSettings();
  const update = useSettingsStore((s) => s.update);

  const [unlocked, setUnlocked] = useState(false);
  const [changing, setChanging] = useState(false);
  const [stage, setStage] = useState<Stage>(settings.caregiverPinHash ? 'verify' : 'create');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string>();
  const [lockout, setLockout] = useState<PinLockout>(emptyLockout);
  const [now, setNow] = useState(() => Date.now());

  const remainingMs = lockoutRemainingMs(lockout, now);
  const locked = remainingMs > 0;

  // Ticks only while a delay is running.
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [locked]);

  const lockMessage = locked
    ? t('pin.lockedFor', { seconds: Math.ceil(remainingMs / 1000) })
    : undefined;
  useAnnounce(error ?? lockMessage);

  const handleComplete = async (pin: string) => {
    if (locked) return;
    setError(undefined);

    if (stage === 'verify') {
      if ((await hashPin(pin)) === settings.caregiverPinHash) {
        setLockout(emptyLockout());
        if (changing) {
          setStage('create');
        } else {
          setUnlocked(true);
        }
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      const next = registerFailure(lockout, Date.now());
      setLockout(next);
      setNow(Date.now());
      setError(t('pin.wrong'));
      return;
    }

    if (stage === 'create') {
      setFirstPin(pin);
      setStage('confirm');
      return;
    }

    if (pin === firstPin) {
      await update({ caregiverPinHash: await hashPin(pin) });
      setUnlocked(true);
      setChanging(false);
      setStage('verify');
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(t('pin.mismatch'));
      setStage('create');
    }
    setFirstPin('');
  };

  if (!unlocked) {
    const prompt = locked
      ? t('pin.lockedFor', { seconds: Math.ceil(remainingMs / 1000) })
      : stage === 'verify'
        ? changing
          ? t('pin.enterCurrent')
          : t('pin.enter')
        : stage === 'create'
          ? t('pin.create')
          : t('pin.confirm');

    return (
      <Screen>
        <ScreenHeader title={t('pin.title')} />
        <View className="flex-1 justify-center gap-6 p-4">
          <PinPad
            prompt={prompt}
            error={locked ? undefined : error}
            disabled={locked}
            onComplete={handleComplete}
          />
          {/* Shown once mistakes are adding up: a lost PIN must have a way
              out, and the honest one is that caregiver settings live on
              this device only. */}
          {lockout.failedAttempts >= 2 && (
            <AppText size="sm" muted className="text-center">
              {t('pin.forgotten')}
            </AppText>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <GateContext.Provider
      value={{
        restartPinSetup: () => {
          setUnlocked(false);
          setError(undefined);
          setFirstPin('');
          // Prove the current PIN before setting a new one.
          setChanging(Boolean(settings.caregiverPinHash));
          setStage(settings.caregiverPinHash ? 'verify' : 'create');
        },
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </GateContext.Provider>
  );
}
