import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableWithoutFeedback, Keyboard, ScrollView, Pressable } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import * as Icons from 'phosphor-react-native';

const ProfileScreen = () => {
  const { user, profile, setupProfile, logout, theoreticalSavingsCapacity, emergencyCushionLimit } = useAuth();
  const [incomeStr, setIncomeStr] = useState(profile ? profile.monthlyIncome.toString() : '');
  const [vitalStr, setVitalStr] = useState(profile ? profile.vitalExpensesLimit.toString() : '');
  const [loading, setLoading] = useState(false);

  const income = parseInt(incomeStr.replace(/\s/g, '')) || 0;
  const vital = parseInt(vitalStr.replace(/\s/g, '')) || 0;
  const capacity = Math.max(0, income - vital);

  const handleIncomeChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setIncomeStr(numeric);
  };

  const handleVitalChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setVitalStr(numeric);
  };

  const handleUpdate = async () => {
    if (income <= 0) {
      Alert.alert('Modification', 'Veuillez saisir un revenu mensuel valide.');
      return;
    }
    if (vital < 0) {
      Alert.alert('Modification', 'Veuillez saisir des charges vitales valides.');
      return;
    }
    if (vital > income) {
      Alert.alert('Modification', 'Vos charges vitales ne peuvent pas dépasser votre revenu.');
      return;
    }

    setLoading(true);
    try {
      await setupProfile(income, vital);
      Alert.alert('Succès', 'Profil financier mis à jour avec succès.');
    } catch (err) {
      Alert.alert('Modification', "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScreenWrapper>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
              <Icons.UserCircle size={64} color={colors.primary} weight="duotone" />
              <Typo fontWeight="800" size={24} style={{ marginTop: 10 }}>
                {user?.name || 'Utilisateur'}
              </Typo>
              <Typo size={14} color={colors.neutral400}>
                {user?.email || 'email@example.com'}
              </Typo>
            </View>

            {/* Profile Settings form */}
            <View style={styles.card}>
              <Typo size={18} fontWeight="800" style={{ marginBottom: 15 }}>
                Paramètres Financiers
              </Typo>

              {/* Income */}
              <View style={styles.inputGroup}>
                <Typo size={14} fontWeight="600" color={colors.textLight}>
                  Revenu Mensuel Récurrent (FCFA)
                </Typo>
                <Input
                  placeholder="Revenu"
                  keyboardType="numeric"
                  value={incomeStr ? parseInt(incomeStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                  onChangeText={handleIncomeChange}
                  icon={<Icons.Coins size={22} color={colors.primary} weight="fill" />}
                />
              </View>

              {/* Vital charges */}
              <View style={styles.inputGroup}>
                <Typo size={14} fontWeight="600" color={colors.textLight}>
                  Charges du Cercle Vital (FCFA)
                </Typo>
                <Input
                  placeholder="Charges Vitales"
                  keyboardType="numeric"
                  value={vitalStr ? parseInt(vitalStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                  onChangeText={handleVitalChange}
                  icon={<Icons.House size={22} color={colors.rose} weight="fill" />}
                />
              </View>

              {/* Summary Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <Typo size={13} color={colors.textLighter}>
                    {"Capacité d'épargne théorique :"}
                  </Typo>
                  <Typo size={14} fontWeight="800" color={colors.primary}>
                    {formatFCFA(capacity)}
                  </Typo>
                </View>
                <View style={styles.statsRow}>
                  <Typo size={13} color={colors.textLighter}>
                    Coussin de sécurité requis :
                  </Typo>
                  <Typo size={14} fontWeight="800" color={colors.white}>
                    {formatFCFA(vital * 3)}
                  </Typo>
                </View>
              </View>

              <Button loading={loading} onPress={handleUpdate}>
                <Typo color={colors.neutral900} fontWeight="700">
                  Enregistrer les modifications
                </Typo>
              </Button>
            </View>

            {/* Logout Action */}
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Icons.SignOut size={22} color={colors.rose} />
              <Typo size={15} fontWeight="700" color={colors.rose}>
                Se déconnecter
              </Typo>
            </Pressable>
          </ScrollView>
        </ScreenWrapper>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._15,
    paddingBottom: verticalScale(40),
    gap: spacingY._25,
  },
  header: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  card: {
    backgroundColor: colors.neutral800,
    padding: spacingX._20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 15,
  },
  inputGroup: {
    gap: 8,
  },
  statsContainer: {
    gap: 10,
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
  },
});
