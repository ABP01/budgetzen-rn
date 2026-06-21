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

const Register = () => {
  const router = useRouter();
  const { register } = useAuth();
  const emailRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const nameRef = useRef<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Inscription", "Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      const res = await register(emailRef.current, nameRef.current);
      if (!res.success) {
        Alert.alert("Inscription", res.msg || "Une erreur est survenue");
      }
    } catch (err) {
      Alert.alert("Inscription", "Impossible de créer le compte");
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
            Créer un
          </Typo>
          <Typo fontWeight={"800"} size={30}>
            Nouveau Compte
          </Typo>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLight}>
            Inscrivez-vous pour gérer vos finances avec Pursio
          </Typo>
          {/* Input */}
          <Input
            placeholder="Nom complet"
            onChangeText={(value) => (nameRef.current = value)}
            icon={
              <Icons.User
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />
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

          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo color={colors.neutral900} fontWeight={"700"}>
              {"S'inscrire"}
            </Typo>
          </Button>
        </View>
        {/* footer */}
        <View style={styles.footer}>
          <Typo size={15}>Déjà membre ?</Typo>
          <Pressable onPress={() => {router.navigate("/(auth)/login" as any);}}>
            <Typo size={15} fontWeight={"700"} color={colors.primary}>
              Se connecter
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Register;

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