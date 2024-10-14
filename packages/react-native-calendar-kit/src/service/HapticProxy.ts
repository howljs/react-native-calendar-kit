import {
  createModuleProxy,
  OptionalDependencyNotInstalledError,
} from './ModuleProxy';

export const ReactNativeHapticFeedbackProxy = createModuleProxy<any>(() => {
  try {
    return require('react-native-haptic-feedback');
  } catch (e) {
    throw new OptionalDependencyNotInstalledError(
      'react-native-haptic-feedback'
    );
  }
});
