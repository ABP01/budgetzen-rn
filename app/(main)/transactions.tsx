import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Alert,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import { LIcon, icons } from '@/constants/icons';

const Circles = ['VITAL', 'CROISSANCE', 'PLAISIR'] as const;
type CircleType = typeof Circles[number];

const Sources = ['CASH', 'WAVE', 'ORANGE_MONEY', 'MOOV', 'MTN'] as const;
type SourceType = typeof Sources[number];

const TransactionsScreen = () => {
  const {
    transactions,
    addTransaction,
    profile,
    projects,
    theoreticalSavingsCapacity,
    emergencyCushionAllocated,
    emergencyCushionLimit,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'history' | 'add'>('history');
  const [filterCircle, setFilterCircle] = useState<'ALL' | CircleType>('ALL');

  // Form states
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [circle, setCircle] = useState<CircleType>('VITAL');
  const [source, setSource] = useState<SourceType>('CASH');
  const [description, setDescription] = useState('');

  const amount = parseInt(amountStr.replace(/\s/g, '')) || 0;

  // Handle dynamic text input formatting
  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAmountStr(numeric);
  };

  const handleAdd = async () => {
    if (amount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }

    try {
      await addTransaction(txType, amount, circle, source, description);
      
      // Auto-allocation message to Cushion
      const isCushionFunded = emergencyCushionAllocated >= emergencyCushionLimit;
      if (txType === 'income' && !isCushionFunded) {
        const cushionLimit = emergencyCushionLimit;
        const autoAllocated = Math.min(amount, cushionLimit - emergencyCushionAllocated);
        Alert.alert(
          'Transaction Enregistrée',
          `Revenu enregistré avec succès.\n\nConformément aux spécifications, ${formatFCFA(autoAllocated)} ont été automatiquement fléchés vers votre Coussin de Précaution.`
        );
      } else {
        Alert.alert('Succès', 'Transaction enregistrée avec succès.');
      }

      // Reset form
      setAmountStr('');
      setDescription('');
      setActiveTab('history');
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'enregistrer la transaction.");
    }
  };

  // Inline Plaisir impact calculator for US #04 preview
  const showPlaisirImpact = txType === 'expense' && circle === 'PLAISIR' && amount > 0;
  const dailyCapacity = (theoreticalSavingsCapacity || 0) / 30;
  const projectDelayDays = dailyCapacity > 0 ? Math.round(amount / dailyCapacity) : 0;
  const primaryProject = projects.find(p => p.id !== 'emergency-cushion');

  // Filtered transactions
  const filteredTx = transactions.filter(
    t => filterCircle === 'ALL' || t.cercle === filterCircle
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScreenWrapper>
          <View style={styles.container}>
            {/* Navigation Tabs */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                onPress={() => setActiveTab('history')}
              >
                <Typo
                  size={15}
                  fontWeight="700"
                  color={activeTab === 'history' ? colors.neutral900 : colors.textLight}
                >
                  Historique
                </Typo>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === 'add' && styles.activeTab]}
                onPress={() => setActiveTab('add')}
              >
                <Typo
                  size={15}
                  fontWeight="700"
                  color={activeTab === 'add' ? colors.neutral900 : colors.textLight}
                >
                  Ajouter
                </Typo>
              </Pressable>
            </View>

            {activeTab === 'history' ? (
              // Transaction History list
              <View style={{ flex: 1 }}>
                {/* Quick filter by circle */}
                <View style={styles.filterRow}>
                  {(['ALL', ...Circles] as const).map(c => (
                    <Pressable
                      key={c}
                      style={[styles.filterBadge, filterCircle === c && styles.activeFilterBadge]}
                      onPress={() => setFilterCircle(c)}
                    >
                      <Typo
                        size={11}
                        fontWeight="700"
                        color={filterCircle === c ? colors.neutral900 : colors.textLighter}
                      >
                        {c === 'ALL' ? 'TOUS' : c}
                      </Typo>
                    </Pressable>
                  ))}
                </View>

                {filteredTx.length === 0 ? (
                  <View style={styles.emptyState}>
                    <LIcon icon={icons.warningOutline} size={44} color={colors.neutral500} />
                    <Typo size={15} color={colors.neutral400} style={{ marginTop: 12 }}>
                      Aucune transaction trouvée.
                    </Typo>
                  </View>
                ) : (
                  <FlatList
                    data={filteredTx}
                    keyExtractor={item => item.id || ''}
                    contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                      const isIncome = item.type === 'income';
                      return (
                        <View style={styles.txCard}>
                          <View style={styles.txRow}>
                            <View style={styles.txIconBg}>
                              <LIcon
                                icon={isIncome ? icons.arrowUp : icons.arrowDown}
                                size={18}
                                color={isIncome ? colors.primary : colors.rose}
                              />
                            </View>
                            <View style={styles.txInfo}>
                              <Typo size={15} fontWeight="700" textProps={{ numberOfLines: 1 }}>
                                {item.description || (isIncome ? 'Entrée de fonds' : 'Achat')}
                              </Typo>
                              <View style={styles.txMeta}>
                                <View style={[styles.circleBadge, {
                                  backgroundColor: item.cercle === 'VITAL' ? colors.neutral700 : item.cercle === 'CROISSANCE' ? colors.primaryDark : '#0ea5e9'
                                }]}>
                                  <Typo size={9} fontWeight="700" color={item.cercle === 'CROISSANCE' ? colors.neutral900 : colors.white}>
                                    {item.cercle}
                                  </Typo>
                                </View>
                                <Typo size={11} color={colors.neutral400}>
                                  {item.source} • {new Date(item.date).toLocaleDateString('fr-FR')}
                                </Typo>
                              </View>
                            </View>
                            <Typo size={15} fontWeight="800" color={isIncome ? colors.primary : colors.white}>
                              {isIncome ? '+' : '-'} {formatFCFA(item.amount)}
                            </Typo>
                          </View>
                        </View>
                      );
                    }}
                  />
                )}
              </View>
            ) : (
              // Add Transaction Form
              <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
                <Typo size={22} fontWeight="800" style={{ marginBottom: 10 }}>
                  Enregistrer un flux
                </Typo>

                {/* Type Selection */}
                <View style={styles.typeSelector}>
                  <Pressable
                    style={[styles.typeBtn, txType === 'expense' && styles.typeBtnExpense]}
                    onPress={() => {
                      setTxType('expense');
                      if (circle === 'CROISSANCE') setCircle('VITAL');
                    }}
                  >
                    <Typo
                      size={14}
                      fontWeight="700"
                      color={txType === 'expense' ? colors.white : colors.textLighter}
                    >
                      Dépense (-)
                    </Typo>
                  </Pressable>
                  <Pressable
                    style={[styles.typeBtn, txType === 'income' && styles.typeBtnIncome]}
                    onPress={() => {
                      setTxType('income');
                      setCircle('CROISSANCE');
                    }}
                  >
                    <Typo
                      size={14}
                      fontWeight="700"
                      color={txType === 'income' ? colors.neutral900 : colors.textLighter}
                    >
                      Revenu / Épargne (+)
                    </Typo>
                  </Pressable>
                </View>

                {/* Amount Input */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Montant (FCFA)
                  </Typo>
                  <Input
                    placeholder="Montant nominal"
                    keyboardType="numeric"
                    value={amountStr ? parseInt(amountStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                    onChangeText={handleAmountChange}
                    icon={<LIcon icon={icons.dollar} size={20} color={colors.primary} />}
                  />
                </View>

                {/* Circle Selection (Only for expenses, incomes are auto-directed) */}
                {txType === 'expense' && (
                  <View style={styles.inputGroup}>
                    <Typo size={14} fontWeight="600" color={colors.textLight}>
                      Cercle Financier
                    </Typo>
                    <View style={styles.cercleSelector}>
                      {Circles.map(c => (
                        <Pressable
                          key={c}
                          style={[
                            styles.cercleBtn,
                            circle === c && styles.activeCercleBtn,
                            circle === c && c === 'VITAL' && { borderColor: colors.white },
                            circle === c && c === 'CROISSANCE' && { borderColor: colors.primary },
                            circle === c && c === 'PLAISIR' && { borderColor: '#0ea5e9' },
                          ]}
                          onPress={() => setCircle(c)}
                        >
                          <Typo
                            size={12}
                            fontWeight="700"
                            color={circle === c ? colors.white : colors.textLighter}
                          >
                            {c}
                          </Typo>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Liquid Source Selection */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Source de Liquidité
                  </Typo>
                  <View style={styles.sourceGrid}>
                    {Sources.map(s => (
                      <Pressable
                        key={s}
                        style={[styles.sourceBtn, source === s && styles.activeSourceBtn]}
                        onPress={() => setSource(s)}
                      >
                        <Typo
                          size={12}
                          fontWeight="700"
                          color={source === s ? colors.neutral900 : colors.textLighter}
                        >
                          {s.replace('_', ' ')}
                        </Typo>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Description (Optionnel)
                  </Typo>
                  <Input
                    placeholder="Ex: Facture électricité CEET, Dépôt Wave"
                    value={description}
                    onChangeText={setDescription}
                    icon={<LIcon icon={icons.note} size={20} color={colors.neutral400} />}
                  />
                </View>

                {/* Real-time Predictive Warning for Plaisir Circle */}
                {showPlaisirImpact && (
                  <View style={styles.impactCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <LIcon icon={icons.warning} size={18} color="#0ea5e9" />
                      <Typo size={14} fontWeight="700" color="#0ea5e9">
                        {"Alerte d'Impact Prédictive (US #04)"}
                      </Typo>
                    </View>
                    <Typo size={13} color={colors.textLight} style={{ marginTop: 6, lineHeight: 18 }}>
                      {"Cette dépense imprévue du Cercle Plaisir repoussera la réalisation de votre projet "}
                      <Typo fontWeight="800" color={colors.primary}>
                        {primaryProject ? primaryProject.name : 'Coussin de sécurité'}
                      </Typo>
                      {" de approximativement "}
                      <Typo fontWeight="800" color="#ef4444">
                        {projectDelayDays} jours
                      </Typo>
                      .
                    </Typo>
                  </View>
                )}

                <Button onPress={handleAdd}>
                  <Typo color={colors.neutral900} fontWeight="700">
                    Enregistrer la Transaction
                  </Typo>
                </Button>
              </ScrollView>
            )}
          </View>
        </ScreenWrapper>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: 4,
    marginVertical: verticalScale(15),
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius._10,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  filterBadge: {
    backgroundColor: colors.neutral800,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  activeFilterBadge: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  txCard: {
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconBg: {
    width: 36,
    height: 36,
    borderRadius: radius._10,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  circleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formScroll: {
    gap: spacingY._20,
    paddingBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral800,
    padding: 4,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius._10,
  },
  typeBtnExpense: {
    backgroundColor: colors.rose,
  },
  typeBtnIncome: {
    backgroundColor: colors.primary,
  },
  cercleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  cercleBtn: {
    flex: 1,
    backgroundColor: colors.neutral800,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius._10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCercleBtn: {
    backgroundColor: '#1E1E1E',
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceBtn: {
    backgroundColor: colors.neutral800,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  activeSourceBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  impactCard: {
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    padding: spacingX._15,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
});
