import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative glass background blobs */}
      <View style={styles.bgBlobPrimary} />
      <View style={styles.bgBlobBlue} />
      <View style={styles.bgBlobRose} />
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(auth)/login" as any)} style={styles.loginButton}>
            <Typo fontWeight={"700"} color={colors.primary}>Se connecter</Typo>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeIn.duration(1200)}
            source={require("../../assets/images/welcome.png")}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        {/* footer */}
        <View style={styles.footer}>
            <Animated.View
              entering={FadeInDown.duration(1000).springify().damping(12)}
              style={{ alignItems: "center" }}
            >
              <Typo size={32} fontWeight={"800"} style={{ fontFamily: 'Outfit-Bold' }}>
                Prenez le contrôle
              </Typo>
              <Typo size={32} fontWeight={"800"} color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>
                de vos finances
              </Typo>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(1000)
                .delay(100)
                .springify()
                .damping(12)}
              style={{ alignItems: "center", gap: 5, paddingHorizontal: 20 }}
            >
              <Typo size={15} color={colors.textLighter} style={{ textAlign: 'center', lineHeight: 22 }}>
                Gérez votre argent avec la règle des 3 cercles et sécurisez votre coussin de précaution local en FCFA.
              </Typo>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(1000).delay(200).springify().damping(12)}
              style={styles.buttonContainer}
            >
              <Button onPress={() => router.push("/(auth)/register" as any)}>
                <Typo size={16} fontWeight={"700"} color={colors.neutral900}>
                  Commencer l'aventure
                </Typo>
              </Button>
            </Animated.View>
        </View>
      </View>
    </ScreenWrapper >
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacingY._7,
    zIndex: 2,
  },
  header: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeImage: {
    width: "85%",
    height: verticalScale(280),
    alignSelf: "center",
    marginTop: verticalScale(40),
  },
  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius._10,
  },
  footer: {
    alignItems: "center",
    backgroundColor: 'rgba(5, 5, 5, 0.85)',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._25,
  },
  bgBlobPrimary: {
    position: 'absolute',
    width: screenWidth * 0.75,
    height: screenWidth * 0.75,
    borderRadius: (screenWidth * 0.75) / 2,
    backgroundColor: 'rgba(220, 253, 139, 0.12)', // Neon Lime
    top: -50,
    right: -50,
  },
  bgBlobBlue: {
    position: 'absolute',
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: (screenWidth * 0.7) / 2,
    backgroundColor: 'rgba(14, 165, 233, 0.1)', // Electric Blue
    top: screenHeight * 0.35,
    left: -screenWidth * 0.2,
  },
  bgBlobRose: {
    position: 'absolute',
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
    borderRadius: (screenWidth * 0.65) / 2,
    backgroundColor: 'rgba(239, 68, 68, 0.06)', // Rose
    bottom: 50,
    right: -55,
  },
});
