import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "@/context/AuthContext";

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
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo fontWeight={"800"} size={30}>
            Heureux de
          </Typo>
          <Typo fontWeight={"800"} size={30}>
            vous revoir !
          </Typo>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLight}>
            Connectez-vous pour suivre votre budget des 3 cercles
          </Typo>
          {/* Input */}
          <Input
            placeholder="Adresse e-mail"
            onChangeText={(value) => (emailRef.current = value)}
            icon={
              <Icons.At
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />
          <Input
            placeholder="Mot de passe"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            icon={
              <Icons.Lock
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />
          <Typo style={{ alignSelf: "flex-end" }}>Mot de passe oublié ?</Typo>

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
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: colors.text,
    fontSize: verticalScale(15),
  },
});