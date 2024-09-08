import {
  ExpoHapticProxy,
  ReactNativeHapticFeedbackProxy,
} from '../dependencies/HapticProxy';

class HapticService {
  public isHapticFeedbackEnabled: boolean = false;
  public useExpoHaptics: boolean = false;
  public isReactNativeHapticFeedbackAvailable = false;
  public isExpoHapticsAvailable = false;

  constructor() {
    try {
      ReactNativeHapticFeedbackProxy.default;
      this.isReactNativeHapticFeedbackAvailable = true;
    } catch (error) {}

    try {
      ExpoHapticProxy.ImpactFeedbackStyle;
      this.isExpoHapticsAvailable = true;
    } catch (error) {}
  }

  public setEnabled(isEnabled: boolean) {
    if (isEnabled) {
      if (this.isExpoHapticsAvailable) {
        this.useExpoHaptics = true;
      } else if (this.isReactNativeHapticFeedbackAvailable) {
        this.useExpoHaptics = false;
      } else {
        throw new Error(
          'No haptic feedback library available. Please install one of the following packages: expo-haptics or react-native-haptic-feedback'
        );
      }
    }
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
