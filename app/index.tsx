import { StyleSheet, Text, Image, View } from 'react-native';
import React, { useEffect } from 'react';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';

const Index = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (!user) {
          router.replace('/(auth)/welcome');
        } else if (!profile || !profile.isSetupComplete) {
          router.replace('/(auth)/setup-profile');
        } else {
          router.replace('/(main)');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, user, profile]);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={require('../assets/images/splashImage.png')}
      />
      <Text style={styles.title}>Pursio</Text>
      {loading && <Loading />}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
  },
  logo: {
    height: '20%',
    aspectRatio: 1,
  },
  title: {
    color: colors.neutral50,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
});
