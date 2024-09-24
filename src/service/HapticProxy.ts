import type * as ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import type * as ExpoHaptic from 'expo-haptics';

import {
  createModuleProxy,
  OptionalDependencyNotInstalledError,
} from './ModuleProxy';

type TExpoHaptic = typeof ExpoHaptic;

export const ExpoHapticProxy = createModuleProxy<TExpoHaptic>(() => {
  try {
    return require('expo-haptics');
  } catch (e) {
    throw new OptionalDependencyNotInstalledError('expo-haptics');
  }
});

type TReactNativeHapticFeedback = typeof ReactNativeHapticFeedback;
export const ReactNativeHapticFeedbackProxy =
  createModuleProxy<TReactNativeHapticFeedback>(() => {
    try {
      return require('react-native-haptic-feedback');
    } catch (e) {
      throw new OptionalDependencyNotInstalledError(
        'react-native-haptic-feedback'
      );
    }
  });
