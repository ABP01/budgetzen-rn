import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import GaugeCircles from '@/components/GaugeCircles';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import * as Icons from 'phosphor-react-native';
import { useRouter } from 'expo-router';

const Dashboard = () => {
  const {
    user,
    profile,
    transactions,
    totalBalance,
    emergencyCushionLimit,
    emergencyCushionAllocated,
    theoreticalSavingsCapacity,
  } = useAuth();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(false);

  // Check if a new savings transaction was added recently to trigger the pulse
  useEffect(() => {
    if (transactions.length > 0 && transactions[0].type === 'income') {
      setAnimatePulse(true);
      const timer = setTimeout(() => setAnimatePulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate current month statistics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const currentMonthTransactions = transactions.filter(t => t.timestamp >= startOfMonth);

  const vitalSpent = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.cercle === 'VITAL')
    .reduce((acc, t) => acc + t.amount, 0);

  const plaisirSpent = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.cercle === 'PLAISIR')
    .reduce((acc, t) => acc + t.amount, 0);

  // Progress calculations
  const vitalLimit = profile?.vitalExpensesLimit || 1;
  const vitalProgress = vitalSpent / vitalLimit;

  const cushionProgress = emergencyCushionLimit > 0 ? emergencyCushionAllocated / emergencyCushionLimit : 0;

  // Plaisir budget limit is the remaining savings capacity after vital expenses
  const plaisirLimit = theoreticalSavingsCapacity || 1;
  const plaisirProgress = plaisirSpent / plaisirLimit;

  const isCushionFunded = emergencyCushionAllocated >= emergencyCushionLimit;

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Typo size={14} color={colors.textLight}>
              Bonjour,
            </Typo>
            <Typo size={22} fontWeight="800">
              {user?.name || 'Épargnant'}
            </Typo>
          </View>
          <Pressable style={styles.profileBtn} onPress={() => router.push('/(main)/profile')}>
            <Icons.UserCircle size={32} color={colors.primary} weight="duotone" />
          </Pressable>
        </View>

        {/* Total Available Balance Card */}
        <View style={styles.balanceCard}>
          <Typo size={14} color={colors.textLighter} fontWeight="500">
            Liquidités Disponibles
          </Typo>
          <Typo size={36} fontWeight="800" color={colors.primary} style={styles.balanceText}>
            {formatFCFA(totalBalance)}
          </Typo>
          <View style={styles.capacityRow}>
            <Icons.Sparkle size={16} color={colors.primary} weight="fill" />
            <Typo size={12} color={colors.textLight} style={{ marginLeft: 6 }}>
              {"Capacité d'épargne mensuelle théorique : "}{formatFCFA(theoreticalSavingsCapacity)}
            </Typo>
          </View>
        </View>

        {/* Concentric Circles Gauge */}
        <GaugeCircles
          vitalProgress={vitalProgress}
          croissanceProgress={cushionProgress}
          plaisirProgress={plaisirProgress}
          animateCroissance={animatePulse}
        />

        {/* Local Emergency Cushion Card (Fsécurité) */}
        <View style={[styles.cushionCard, !isCushionFunded && styles.cushionUnfunded]}>
          <View style={styles.cushionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {isCushionFunded ? (
                <Icons.ShieldCheck size={24} color={colors.primary} weight="fill" />
              ) : (
                <Icons.WarningOctagon size={24} color={colors.rose} weight="fill" />
              )}
              <Typo size={16} fontWeight="700">
                Coussin de Précaution Local
              </Typo>
            </View>
            <View style={styles.lockContainer}>
              {!isCushionFunded && (
                <View style={styles.lockTag}>
                  <Icons.Lock size={12} color={colors.rose} weight="fill" />
                  <Typo size={10} color={colors.rose} fontWeight="700" style={{ marginLeft: 4 }}>
                    Projets Plaisir Verrouillés
                  </Typo>
                </View>
              )}
            </View>
          </View>

          <Typo size={13} color={colors.textLight} style={{ marginVertical: 8 }}>
            Objectif (3 mois du Cercle Vital) : {formatFCFA(emergencyCushionLimit)}
          </Typo>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, cushionProgress * 100)}%`,
                  backgroundColor: isCushionFunded ? colors.primary : colors.rose,
                },
              ]}
            />
          </View>

          <View style={styles.cushionFooter}>
            <Typo size={14} fontWeight="800">
              {formatFCFA(emergencyCushionAllocated)} constitué
            </Typo>
            <Typo size={12} color={colors.textLighter}>
              {Math.round(cushionProgress * 100)}%
            </Typo>
          </View>
        </View>

        {/* Monthly Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Typo size={12} color={colors.textLight}>
              Cercle Vital (Dépenses)
            </Typo>
            <Typo size={16} fontWeight="800">
              {formatFCFA(vitalSpent)}
            </Typo>
          </View>
          <View style={styles.summaryItem}>
            <Typo size={12} color={colors.textLight}>
              Cercle Plaisir (Dépenses)
            </Typo>
            <Typo size={16} fontWeight="800">
              {formatFCFA(plaisirSpent)}
            </Typo>
          </View>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Typo size={18} fontWeight="800">
              Transactions Récentes
            </Typo>
            <Pressable onPress={() => router.push('/(main)/transactions')}>
              <Typo size={13} color={colors.primary} fontWeight="700">
                Voir tout
              </Typo>
            </Pressable>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icons.FileText size={32} color={colors.neutral500} />
              <Typo size={14} color={colors.neutral400} style={{ marginTop: 8 }}>
                Aucune transaction pour le moment.
              </Typo>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 3).map((item) => {
                const isIncome = item.type === 'income';
                return (
                  <View key={item.id} style={styles.transactionItem}>
                    <View style={styles.txIconContainer}>
                      {isIncome ? (
                        <Icons.ArrowUpRight size={20} color={colors.primary} weight="bold" />
                      ) : (
                        <Icons.ArrowDownLeft size={20} color={colors.rose} weight="bold" />
                      )}
                    </View>
                    <View style={styles.txDetails}>
                      <Typo size={15} fontWeight="700" numberOfLines={1}>
                        {item.description || (isIncome ? 'Flux Entrant' : 'Flux Sortant')}
                      </Typo>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <View style={[styles.circleBadge, {
                          backgroundColor: item.cercle === 'VITAL' ? colors.neutral700 : item.cercle === 'CROISSANCE' ? colors.primaryDark : '#0284c7'
                        }]}>
                          <Typo size={9} fontWeight="700" color={item.cercle === 'CROISSANCE' ? colors.neutral900 : colors.white}>
                            {item.cercle}
                          </Typo>
                        </View>
                        <Typo size={11} color={colors.textLight}>
                          {item.source}
                        </Typo>
                      </View>
                    </View>
                    <Typo size={15} fontWeight="800" color={isIncome ? colors.primary : colors.white}>
                      {isIncome ? '+' : '-'} {formatFCFA(item.amount)}
                    </Typo>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: spacingX._15,
    paddingBottom: verticalScale(40),
    gap: spacingY._20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(15),
  },
  profileBtn: {
    padding: 4,
  },
  balanceCard: {
    backgroundColor: colors.neutral800,
    padding: spacingX._20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 8,
  },
  balanceText: {
    letterSpacing: -1,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cushionCard: {
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  cushionUnfunded: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cushionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockContainer: {
    alignItems: 'flex-end',
  },
  lockTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cushionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.neutral800,
    padding: spacingX._12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 6,
  },
  recentSection: {
    gap: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: colors.neutral800,
    padding: 30,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  transactionsList: {
    backgroundColor: colors.neutral800,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingX._15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  circleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
