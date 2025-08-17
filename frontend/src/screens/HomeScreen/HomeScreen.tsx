import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from '@/src/components';
import { colors, typography, spacing } from '@/src/utils/theme';

export default function HomeScreen() {
  const handleGetStarted = () => {
    // Navigation logic here
    console.log('Getting started...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recipe App</Text>
        <Text style={styles.subtitle}>Discover and save your favorite recipes</Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Get Started" 
            onPress={handleGetStarted}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});