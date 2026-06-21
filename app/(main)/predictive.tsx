import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import * as Icons from 'phosphor-react-native';

const PredictiveScreen = () => {
  const {
    projects,
    theoreticalSavingsCapacity,
    emergencyCushionLimit,
    emergencyCushionAllocated,
  } = useAuth();

  const [simulateAmountStr, setSimulateAmountStr] = useState('');

  const simulateAmount = parseInt(simulateAmountStr.replace(/\s/g, '')) || 0;

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setSimulateAmountStr(numeric);
  };

  const dailySavings = (theoreticalSavingsCapacity || 0) / 30;

  // Calculate project details and impact
  const isCushionFunded = emergencyCushionAllocated >= emergencyCushionLimit;
  const activeProjects = projects.filter(p => p.id !== 'emergency-cushion' || !isCushionFunded);
  const prioritizedActiveProject = activeProjects.length > 0 ? activeProjects[0] : null;

  const delayDays = dailySavings > 0 ? Math.round(simulateAmount / dailySavings) : 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScreenWrapper>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
              <Typo fontWeight="800" size={30}>
                {"Simulateur d'Achat"}
              </Typo>
              <Typo fontWeight="800" size={30} color="#0ea5e9">
                Alerte Prédictive
              </Typo>
              <Typo size={15} color={colors.textLight} style={{ marginTop: 6 }}>
                {"Saisissez le montant d'un achat loisir (Plaisir) envisagé pour calculer son impact sur vos projets de vie."}
              </Typo>
            </View>

            {/* Saisie Montant */}
            <View style={styles.card}>
              <Typo size={14} fontWeight="600" color={colors.textLighter}>
                {"Montant de l'achat Plaisir simulé (FCFA)"}
              </Typo>
              <Input
                placeholder="Ex: 50 000"
                keyboardType="numeric"
                value={simulateAmountStr ? parseInt(simulateAmountStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                onChangeText={handleAmountChange}
                icon={<Icons.Calculator size={22} color="#0ea5e9" weight="fill" />}
              />
            </View>

            {/* Calculations and Warning Display */}
            {simulateAmount > 0 ? (
              <View style={styles.resultContainer}>
                {dailySavings <= 0 ? (
                  <View style={styles.errorCard}>
                    <Icons.WarningCircle size={24} color={colors.rose} weight="fill" />
                    <Typo size={14} color={colors.textLight} style={{ marginLeft: 8, flex: 1 }}>
                      {"Votre capacité d'épargne est de 0 FCFA. Réglez vos revenus ou charges vitales dans votre profil pour pouvoir simuler des impacts."}
                    </Typo>
                  </View>
                ) : (
                  <View style={styles.warningCard}>
                    <View style={styles.warningHeader}>
                      <Icons.Warning size={24} color="#ef4444" weight="fill" />
                      <Typo size={18} fontWeight="800" color="#ef4444">
                        Impact sur votre Objectif
                      </Typo>
                    </View>

                    <Typo size={15} color={colors.textLight} style={{ marginTop: 10, lineHeight: 22 }}>
                      {"Cette dépense de "}
                      <Typo fontWeight="800" color="#0ea5e9">
                        {formatFCFA(simulateAmount)}
                      </Typo>
                      {" retardera la réalisation de votre projet "}
                      <Typo fontWeight="800" color={colors.primary}>
                        {prioritizedActiveProject ? prioritizedActiveProject.name : 'Coussin de Sécurité'}
                      </Typo>
                      {" de :"}
                    </Typo>

                    <View style={styles.delayDisplay}>
                      <Typo size={48} fontWeight="900" color="#ef4444">
                        {delayDays}
                      </Typo>
                      <Typo size={18} fontWeight="800" color="#ef4444" style={{ marginTop: -5 }}>
                        Jours de retard
                      </Typo>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailsRow}>
                      <Typo size={13} color={colors.textLighter}>
                        {"Capacité d'épargne quotidienne :"}
                      </Typo>
                      <Typo size={13} fontWeight="700">
                        {formatFCFA(Math.round(dailySavings))} / jour
                      </Typo>
                    </View>
                  </View>
                )}

                {/* Impact details for other active projects if there are multiple */}
                {activeProjects.length > 1 && dailySavings > 0 && (
                  <View style={styles.secondaryCard}>
                    <Typo size={15} fontWeight="700" style={{ marginBottom: 12 }}>
                      Retard induit sur vos autres projets :
                    </Typo>
                    {activeProjects.slice(1).map(p => (
                      <View key={p.id} style={styles.projectImpactRow}>
                        <Typo size={14} color={colors.textLight}>
                          {p.name}
                        </Typo>
                        <Typo size={14} fontWeight="700" color={colors.rose}>
                          +{delayDays} jours
                        </Typo>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              // Empty State
              <View style={styles.placeholderCard}>
                <Icons.Eye size={42} color={colors.neutral500} />
                <Typo size={14} color={colors.neutral400} style={{ marginTop: 12, textAlign: 'center' }}>
                  {"Entrez un montant ci-dessus pour projeter instantanément l'impact de cet achat sur vos projets."}
                </Typo>
              </View>
            )}
          </ScrollView>
        </ScreenWrapper>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PredictiveScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._15,
    paddingBottom: verticalScale(40),
    gap: spacingY._20,
  },
  header: {
    marginTop: verticalScale(15),
  },
  card: {
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 10,
  },
  resultContainer: {
    gap: spacingY._20,
  },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: spacingX._20,
    borderRadius: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  delayDisplay: {
    alignItems: 'center',
    marginVertical: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 15,
    borderRadius: 12,
  },
  placeholderCard: {
    backgroundColor: colors.neutral800,
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryCard: {
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  projectImpactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
});
