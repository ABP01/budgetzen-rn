import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View>
          <TouchableOpacity onPress={() => router.push("/(auth)/login" as any)} style={styles.loginButton}>
            <Typo fontWeight={"500"}>Sign In</Typo>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeIn.duration(1000)}
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
              <Typo size={32} fontWeight={"800"}>
                Prenez le contrôle
              </Typo>
              <Typo size={32} fontWeight={"800"}>
                de vos finances
              </Typo>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(1000)
                .delay(100)
                .springify()
                .damping(12)}
              style={{ alignItems: "center", gap: 5 }}
            >
              <Typo size={16} color={colors.textLight} style={{ textAlign: 'center' }}>
                Gérez votre argent avec la règle des 3 cercles et
              </Typo>
              <Typo size={16} color={colors.textLight} style={{ textAlign: 'center' }}>
                sécurisez votre coussin de précaution local en FCFA.
              </Typo>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(1000).delay(200).springify().damping(12)}
              style={styles.buttonContainer}
            >
              <Button onPress={() => router.push("/(auth)/register" as any)}>
                <Typo size={18} fontWeight={"700"} color={colors.neutral900}>
                  Commencer
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
  },
  welcomeImage: {
    width: "100%",
    height: verticalScale(300),
    alignSelf: "center",
    marginTop: verticalScale(100),
  },
  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20,
  },
  footer: {
    alignItems: "center",
    backgroundColor: colors.neutral900,
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20,
    shadowColor: "white",
    shadowOffset: { width: 0, height: -10 },
    elevation: 10,
    shadowOpacity: 0.15,
    shadowRadius: 25,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._25,
  },
});
