import * as Haptics from 'expo-haptics';

import { hapticLight, hapticSuccess, hapticWarning } from './haptics';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 1 },
  NotificationFeedbackType: { Success: 2, Warning: 3 },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve())
}));

describe('haptics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ejecuta feedback de exito y advertencia', async () => {
    await hapticSuccess();
    await hapticWarning();

    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      1,
      Haptics.NotificationFeedbackType.Success
    );
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      2,
      Haptics.NotificationFeedbackType.Warning
    );
  });

  it('ejecuta impacto ligero', async () => {
    await hapticLight();

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });
});
