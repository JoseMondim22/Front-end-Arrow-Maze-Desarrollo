import { StyleSheet, Text, View } from 'react-native';

/** Placeholder Home screen — proves the navigation + Expo pipeline works end to
 * end before the real screens (with board rendering, presenters, etc.) are built. */
export function HomeScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arrow Maze</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
