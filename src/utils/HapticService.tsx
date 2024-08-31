import { NativeModules } from 'react-native';
import {
  ReactNativeHapticFeedbackProxy,
  ExpoHapticProxy,
} from '../dependencies/HapticProxy';

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
      return ExpoHapticProxy.impactAsync(
        ExpoHapticProxy.ImpactFeedbackStyle.Medium
      );
    }

    return ReactNativeHapticFeedbackProxy.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    });
  }

  public selection() {
    if (!this.isHapticFeedbackEnabled) {
      return;
    }
    if (this.useExpoHaptics) {
      return ExpoHapticProxy.selectionAsync();
    }

    return ReactNativeHapticFeedbackProxy.trigger('selection', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    });
  }
}

const Haptic = new HapticService();

export default Haptic;
