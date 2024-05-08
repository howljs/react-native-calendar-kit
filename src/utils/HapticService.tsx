import { NativeModules } from 'react-native';

class HapticService {
  public isHapticFeedbackEnabled: boolean = false;
  public useExpoHaptics: boolean = false;

  constructor() {
    const expoConstants =
      NativeModules.NativeUnimoduleProxy?.modulesConstants?.ExponentConstants;
    this.useExpoHaptics = !!expoConstants;
  }

  public setEnabled(isEnabled: boolean) {
    this.isHapticFeedbackEnabled = isEnabled;
  }

  public impact() {
    if (!this.isHapticFeedbackEnabled) {
      return;
    }

    if (this.useExpoHaptics) {
      const ExpoHaptics = require('expo-haptics');
      return ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
    }

    const ReactNativeHapticFeedback =
      require('react-native-haptic-feedback').default;
    return ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    });
  }

  public selection() {
    if (!this.isHapticFeedbackEnabled) {
      return;
    }
    if (this.useExpoHaptics) {
      const ExpoHaptics = require('expo-haptics');
      return ExpoHaptics.selectionAsync();
    }

    const ReactNativeHapticFeedback =
      require('react-native-haptic-feedback').default;
    return ReactNativeHapticFeedback.trigger('selection', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    });
  }
}

const Haptic = new HapticService();

export default Haptic;
