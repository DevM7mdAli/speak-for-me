import { applyLanguageDirection } from '../languageSwitch';

/**
 * The bedside contract: switching language must never resolve quietly
 * having done nothing. Either the layout direction is already correct,
 * or the app reloads, or the caller is told a manual restart is needed
 * so it can say so on screen.
 */
describe('applyLanguageDirection', () => {
  const baseDeps = () => ({
    isRTL: false,
    canReload: true,
    forceRTL: jest.fn(),
    reload: jest.fn().mockResolvedValue(undefined),
  });

  it('reports a manual restart when the reload mechanism is unavailable', async () => {
    // expo-updates is disabled in this project's native config, so
    // Updates.reloadAsync() always rejects. Switching to Arabic from an
    // LTR layout therefore cannot complete on its own.
    const deps = { ...baseDeps(), canReload: false };

    const outcome = await applyLanguageDirection('ar', deps);

    expect(outcome).toEqual({
      kind: 'manual-restart-required',
      reason: 'reload-unavailable',
    });
    expect(deps.forceRTL).toHaveBeenCalledWith(true);
    expect(deps.reload).not.toHaveBeenCalled();
  });

  it('reports a manual restart when the reload itself rejects', async () => {
    const deps = {
      ...baseDeps(),
      reload: jest.fn().mockRejectedValue(new Error('ERR_UPDATES_RELOAD')),
    };

    const outcome = await applyLanguageDirection('ar', deps);

    expect(outcome).toEqual({
      kind: 'manual-restart-required',
      reason: 'reload-failed',
    });
  });

  it('reloads when the direction has to change and reloading is possible', async () => {
    const deps = baseDeps();

    const outcome = await applyLanguageDirection('ar', deps);

    expect(outcome).toEqual({ kind: 'reloaded' });
    expect(deps.forceRTL).toHaveBeenCalledWith(true);
    expect(deps.reload).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the layout direction already matches', async () => {
    const deps = { ...baseDeps(), isRTL: true };

    const outcome = await applyLanguageDirection('ar', deps);

    expect(outcome).toEqual({ kind: 'already-correct' });
    expect(deps.forceRTL).not.toHaveBeenCalled();
    expect(deps.reload).not.toHaveBeenCalled();
  });

  it('switches back to English the same way', async () => {
    const deps = { ...baseDeps(), isRTL: true, canReload: false };

    const outcome = await applyLanguageDirection('en', deps);

    expect(outcome).toEqual({
      kind: 'manual-restart-required',
      reason: 'reload-unavailable',
    });
    expect(deps.forceRTL).toHaveBeenCalledWith(false);
  });
});
