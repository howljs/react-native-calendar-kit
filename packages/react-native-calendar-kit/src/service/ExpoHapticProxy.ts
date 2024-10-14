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
