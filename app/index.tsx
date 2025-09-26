import { StyleSheet, Text, Image, View } from 'react-native'
import React, { useEffect } from 'react'
import { colors } from '@/constants/theme'
import { useRouter } from 'expo-router'

const Index = () => {
  const router = useRouter();

  useEffect(() => {
   setTimeout(() => {
     router.push('/(auth)/welcome');
   }, 2000);

}, []);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={require('../assets/images/splashImage.png')}
      />
      <Text style={styles.title}>BudgetZen</Text>
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
