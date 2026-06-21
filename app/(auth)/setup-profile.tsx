import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import * as Icons from 'phosphor-react-native';

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
        <ScreenWrapper>
          <View style={styles.container}>
            <View style={styles.header}>
              <Typo fontWeight="800" size={32}>
                Initialisation
              </Typo>
              <Typo fontWeight="800" size={32} color={colors.primary}>
                de votre Profil
              </Typo>
              <Typo size={16} color={colors.textLight} style={{ marginTop: 8 }}>
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
                  icon={
                    <Icons.Coins
                      size={verticalScale(24)}
                      color={colors.primary}
                      weight="fill"
                    />
                  }
                />
              </View>

              {/* Vital Expenses Input */}
              <View style={styles.inputGroup}>
                <Typo size={15} fontWeight="600" color={colors.textLight}>
                  Charges Incompressibles / Cercle Vital (FCFA)
                </Typo>
                <Input
                  placeholder="Ex: 200 000"
                  keyboardType="numeric"
                  value={vitalStr ? parseInt(vitalStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                  onChangeText={handleVitalChange}
                  icon={
                    <Icons.House
                      size={verticalScale(24)}
                      color={colors.rose}
                      weight="fill"
                    />
                  }
                />
                <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>
                  Inclus : Loyer, factures (électricité, eau), nourriture de base, transport professionnel.
                </Typo>
              </View>

              {/* Real-time Summary Card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Typo size={15} color={colors.textLighter}>
                    {"Capacité d'épargne théorique :"}
                  </Typo>
                  <Typo size={18} fontWeight="800" color={colors.primary}>
                    {formatFCFA(capacity)}
                  </Typo>
                </View>
                <View style={styles.summaryRow}>
                  <Typo size={15} color={colors.textLighter}>
                    Coussin de précaution cible (3 mois) :
                  </Typo>
                  <Typo size={18} fontWeight="800" color={colors.white}>
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
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
