import {
  createModuleProxy,
  OptionalDependencyNotInstalledError,
} from './ModuleProxy';

export const ExpoHapticProxy = createModuleProxy<any>(() => {
  try {
    return require('expo-haptics');
  } catch (e) {
    throw new OptionalDependencyNotInstalledError('expo-haptics');
  }
});

export const ReactNativeHapticFeedbackProxy = createModuleProxy<any>(() => {
  try {
    return require('react-native-haptic-feedback');
  } catch (e) {
    throw new OptionalDependencyNotInstalledError(
      'react-native-haptic-feedback'
    );
  }
});
