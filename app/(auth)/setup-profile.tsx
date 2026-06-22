import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import { LIcon, icons } from '@/constants/icons';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SetupProfile = () => {
  const { setupProfile } = useAuth();
  const [incomeStr, setIncomeStr] = useState('');
  const [vitalStr, setVitalStr] = useState('');
  const [loading, setLoading] = useState(false);

  // Convert inputs to numbers
  const income = parseInt(incomeStr.replace(/\s/g, '')) || 0;
  const vital = parseInt(vitalStr.replace(/\s/g, '')) || 0;
  const capacity = Math.max(0, income - vital);

  // Handle dynamic text input formatting
  const handleIncomeChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setIncomeStr(numeric);
  };

  const handleVitalChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setVitalStr(numeric);
  };

  const handleSubmit = async () => {
    if (income <= 0) {
      Alert.alert('Configuration', 'Veuillez saisir un revenu mensuel valide.');
      return;
    }
    if (vital < 0) {
      Alert.alert('Configuration', 'Veuillez saisir des charges vitales valides.');
      return;
    }
    if (vital > income) {
      Alert.alert('Configuration', 'Vos charges vitales ne peuvent pas dépasser votre revenu.');
      return;
    }

    setLoading(true);
    try {
      await setupProfile(income, vital);
    } catch (err) {
      Alert.alert('Configuration', "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScreenWrapper style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Decorative glass background blobs */}
          <View style={styles.bgBlobPrimary} />
          <View style={styles.bgBlobBlue} />
          <View style={styles.bgBlobRose} />
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={styles.container}>
            <View style={styles.header}>
              <Typo fontWeight="800" size={32} style={{ fontFamily: 'Outfit-Bold' }}>
                Initialisation
              </Typo>
              <Typo fontWeight="800" size={32} color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>
                de votre Profil
              </Typo>
              <Typo size={15} color={colors.textLighter} style={{ marginTop: 8 }}>
                {"Déclarez vos revenus et charges vitales incompressibles pour lancer l'algorithme des 3 cercles."}
              </Typo>
            </View>

            <View style={styles.form}>
              {/* Income Input */}
              <View style={styles.inputGroup}>
                <Typo size={15} fontWeight="600" color={colors.textLight}>
                  Revenu Mensuel Récurrent (FCFA)
                </Typo>
                <Input
                  placeholder="Ex: 500 000"
                  keyboardType="numeric"
                  value={incomeStr ? parseInt(incomeStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                  onChangeText={handleIncomeChange}
                  icon={<LIcon icon={icons.dollar} size={20} color={colors.primary} />}
                />
              </View>

              {/* Vital Expenses Input */}
              <View style={styles.inputGroup}>
                <Typo size={15} fontWeight="600" color={colors.textLight}>
                  Charges Incompressibles / Cercle Vital (FCFA)
                </Typo>
                <Input
                  placeholder="Ex: 200 000 (ou 0)"
                  keyboardType="numeric"
                  value={vitalStr ? parseInt(vitalStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                  onChangeText={handleVitalChange}
                  icon={<LIcon icon={icons.homeOutline} size={20} color={colors.rose} />}
                />
                <Typo size={11} color={colors.neutral400} style={{ marginTop: 4 }}>
                  Inclus : Loyer, factures (électricité, eau), nourriture de base, transport professionnel. (Charges de 0 valables)
                </Typo>
              </View>

              {/* Real-time Summary Card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Typo size={14} color={colors.textLighter}>
                    {"Capacité d'épargne théorique :"}
                  </Typo>
                  <Typo size={16} fontWeight="800" color={colors.primary}>
                    {formatFCFA(capacity)}
                  </Typo>
                </View>
                <View style={styles.summaryRow}>
                  <Typo size={14} color={colors.textLighter}>
                    Coussin de précaution cible (3 mois) :
                  </Typo>
                  <Typo size={16} fontWeight="800" color={colors.white}>
                    {formatFCFA(vital * 3)}
                  </Typo>
                </View>
              </View>

              <Button loading={loading} onPress={handleSubmit}>
                <Typo color={colors.neutral900} fontWeight="700">
                  Créer mon Profil
                </Typo>
              </Button>
            </View>
          </View>
        </ScreenWrapper>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SetupProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    justifyContent: 'space-between',
    paddingBottom: verticalScale(40),
    zIndex: 2,
  },
  header: {
    marginTop: verticalScale(20),
    gap: 5,
  },
  form: {
    gap: spacingY._25,
    marginTop: verticalScale(30),
  },
  inputGroup: {
    gap: 8,
  },
  summaryCard: {
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    padding: spacingX._15,
    borderRadius: radius._16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
