import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/ui/navigation/RootNavigator';

// Known upstream bug (expo-audio on Android, e.g. github.com/expo/expo issues +
// google/ExoPlayer#9436): AudioPlayer's native constructor sets up a
// MediaSessionCompat unconditionally, and on some Android builds/emulators that
// races and throws a NullPointerException in ISession.getController() deep in
// the OS's own MediaSession code. There's no JS-level flag to opt the player out
// of that MediaSession setup, and the rejection happens on the native bridge's
// internal promise, so it never reaches our try/catch in ExpoAudioService — it
// only ever surfaces as this unhandled-rejection log. It's non-fatal (playback
// for other effects is unaffected); only silence this exact message so any
// other unhandled rejection still shows up.
LogBox.ignoreLogs([/AudioPlayer\.constructor.*has been rejected/]);

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
