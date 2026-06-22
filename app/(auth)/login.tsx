import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import { LIcon, icons } from "@/constants/icons";
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View, Dimensions } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const emailRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Connexion", "Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      const res = await login(emailRef.current);
      if (!res.success) {
        Alert.alert("Connexion", res.msg || "Une erreur est survenue");
      }
    } catch (err) {
      Alert.alert("Connexion", "Impossible de se connecter");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative glass background blobs */}
      <View style={styles.bgBlobPrimary} />
      <View style={styles.bgBlobBlue} />
      <View style={styles.bgBlobRose} />
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo fontWeight={"800"} size={30} style={{ fontFamily: 'Outfit-Bold' }}>
            Heureux de
          </Typo>
          <Typo fontWeight={"800"} size={30} color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>
            vous revoir !
          </Typo>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Typo size={15} color={colors.textLighter} style={{ marginBottom: 10 }}>
            Connectez-vous pour suivre votre budget des 3 cercles.
          </Typo>
          
          <Input
            placeholder="Adresse e-mail"
            onChangeText={(value) => (emailRef.current = value)}
            icon={<LIcon icon={icons.envelope} size={20} color={colors.neutral400} />}
          />
          <Input
            placeholder="Mot de passe"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            icon={<LIcon icon={icons.lock} size={20} color={colors.neutral400} />}
          />
          <Typo style={{ alignSelf: "flex-end" }} color={colors.textLight}>Mot de passe oublié ?</Typo>

          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo color={colors.neutral900} fontWeight={"700"}>
              Se connecter
            </Typo>
          </Button>
        </View>
        
        {/* footer */}
        <View style={styles.footer}>
          <Typo size={15}>Pas de compte ?</Typo>
          <Pressable onPress={() => {router.navigate("/(auth)/register" as any);}}>
            <Typo size={15} fontWeight={"700"} color={colors.primary}>
              {"S'inscrire"}
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
    zIndex: 2,
  },
  form: {
    gap: spacingY._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },
  bgBlobPrimary: {
    position: 'absolute',
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: (screenWidth * 0.7) / 2,
    backgroundColor: 'rgba(220, 253, 139, 0.12)', // Neon Lime
    top: -50,
    right: -50,
  },
  bgBlobBlue: {
    position: 'absolute',
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderRadius: (screenWidth * 0.6) / 2,
    backgroundColor: 'rgba(14, 165, 233, 0.08)', // Electric Blue
    top: screenHeight * 0.35,
    left: -screenWidth * 0.2,
  },
  bgBlobRose: {
    position: 'absolute',
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
    borderRadius: (screenWidth * 0.65) / 2,
    backgroundColor: 'rgba(239, 68, 68, 0.05)', // Rose
    bottom: 50,
    right: -55,
  },
});