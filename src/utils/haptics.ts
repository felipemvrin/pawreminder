import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function runNotificationHaptic(feedback: Haptics.NotificationFeedbackType) {
  if (Platform.OS === 'web') return;

  try {
    await Haptics.notificationAsync(feedback);
  } catch {
    // Haptics are optional feedback and must never block the user flow.
  }
}

async function runImpactHaptic(feedback: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS === 'web') return;

  try {
    await Haptics.impactAsync(feedback);
  } catch {
    // Haptics are optional feedback and must never block the user flow.
  }
}

export function hapticSuccess() {
  return runNotificationHaptic(Haptics.NotificationFeedbackType.Success);
}

export function hapticLight() {
  return runImpactHaptic(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticWarning() {
  return runNotificationHaptic(Haptics.NotificationFeedbackType.Warning);
}
