import { ExpoHapticProxy, ReactNativeHapticFeedbackProxy } from './HapticProxy';

class HapticDependency {
  public isReactNativeHapticFeedbackAvailable: boolean = false;
  public isExpoHapticsAvailable: boolean = false;

  constructor() {
    try {
      if (ReactNativeHapticFeedbackProxy.default) {
        this.isReactNativeHapticFeedbackAvailable = true;
      }
    } catch (error) {}
    try {
      if (ExpoHapticProxy.ImpactFeedbackStyle !== undefined) {
        this.isExpoHapticsAvailable = true;
      }
    } catch (error) {
      // ExpoHapticProxy is not available
    }
  }
}

const hapticDependency = new HapticDependency();

class HapticService {
  public isHapticFeedbackEnabled: boolean = false;
  public useExpoHaptics: boolean = false;

  public setEnabled(isEnabled: boolean) {
    if (isEnabled) {
      if (hapticDependency.isExpoHapticsAvailable) {
        this.useExpoHaptics = true;
      } else if (hapticDependency.isReactNativeHapticFeedbackAvailable) {
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

export default HapticService;
