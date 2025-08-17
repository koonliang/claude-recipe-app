import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/src/components';
import { colors, typography, spacing } from '@/src/utils/theme';
import { useAuth } from '@/src/contexts';
import { isAnonymousModeEnabled } from '@/src/config/appConfig';

export default function HomeScreen() {
  const { loginAsAnonymous } = useAuth();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleTryDemo = async () => {
    try {
      await loginAsAnonymous();
      router.replace('/home');
    } catch (error) {
      console.error('Failed to start demo:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MyRecipeBox</Text>
        <Text style={styles.subtitle}>Discover and save your favorite recipes</Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Get Started" 
            onPress={handleGetStarted}
            fullWidth
          />
          
          <Button 
            title="Go to Login" 
            onPress={handleGoToLogin}
            variant="outline"
            fullWidth
          />
          
          {isAnonymousModeEnabled() && (
            <Button 
              title="🔍 Try Demo" 
              onPress={handleTryDemo}
              variant="secondary"
              fullWidth
            />
          )}
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