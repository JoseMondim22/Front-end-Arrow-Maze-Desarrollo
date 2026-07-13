import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../infrastructure/di/container';
import { Level } from '../../domain/level/Level';
import { DefeatScreen } from '../screens/DefeatScreen';
import { GameScreen } from '../screens/GameScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LevelSelectScreen } from '../screens/LevelSelectScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VictoryScreen } from '../screens/VictoryScreen';

/**
 * Route param list (§16: Home, LevelSelect, Game, Victory, Defeat, Settings —
 * Login/Register added here too, missing from that checklist even though the
 * auth use cases and presenter already exist).
 */
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  LevelSelect: undefined;
  Game: { level: Level };
  Victory: { score: number; level: Level };
  Defeat: { level: Level };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * React Navigation, native-stack (§2). Decides Auth stack vs Home purely from
 * useAuthStore's session state — screens never navigate imperatively after
 * login/register, they just update the store and this component reacts.
 */
export function RootNavigator(): React.JSX.Element {
  const session = useAuthStore((state) => state.session);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    void restoreSession().finally(() => setIsRestoring(false));
  }, [restoreSession]);

  if (isRestoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session === null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Victory" component={VictoryScreen} />
            <Stack.Screen name="Defeat" component={DefeatScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
