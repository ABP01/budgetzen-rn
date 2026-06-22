import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LiquidGlass } from '@/components/LiquidGlass';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import GaugeCircles from '@/components/GaugeCircles';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import { LIcon, icons } from '@/constants/icons';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Dashboard = () => {
  const {
    user,
    profile,
    transactions,
    projects,
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

  // Filter active projects (excluding system emergency cushion)
  const activeProjects = projects.filter(p => p.id !== 'emergency-cushion');

  return (
    <ScreenWrapper style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative glass background blobs */}
      <View style={styles.bgBlobPrimary} />
      <View style={styles.bgBlobBlue} />
      <View style={styles.bgBlobRose} />
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <Pressable style={styles.avatarContainer} onPress={() => router.push('/(main)/profile')}>
            <Image
              source={require('@/assets/images/defaultAvatar.png')}
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Typo size={18} fontWeight="800" style={styles.logoTitle}>
                Pursio
              </Typo>
              <Typo size={12} color={colors.textLight}>
                Bonjour, {user?.name || 'Épargnant'}
              </Typo>
            </View>
          </Pressable>
          
          <View style={styles.headerRight}>
            <View style={styles.currencyBadge}>
              <Typo size={11} fontWeight="800" color={colors.primary}>
                FCFA
              </Typo>
            </View>
            <Pressable style={styles.bellBtn}>
              <LIcon icon={icons.bellOutline} size={20} color={colors.white} />
            </Pressable>
          </View>
        </View>

        {/* Total Available Balance Card */}
        <LiquidGlass intensity={12} style={styles.balanceCard}>
          <Typo size={12} color={colors.textLighter} fontWeight="700" style={styles.balanceLabel}>
            SOLDE TOTAL
          </Typo>
          <Typo size={34} fontWeight="800" color={colors.primary} style={styles.balanceText}>
            {formatFCFA(totalBalance)}
          </Typo>
          
          {/* Source tags */}
          <View style={styles.sourcePillsContainer}>
            <View style={styles.sourcePill}>
              <View style={[styles.sourceDot, { backgroundColor: '#FF6600' }]} />
              <Typo size={10} color={colors.textLight} fontWeight="600">Orange</Typo>
            </View>
            <View style={styles.sourcePill}>
              <View style={[styles.sourceDot, { backgroundColor: '#00A3E0' }]} />
              <Typo size={10} color={colors.textLight} fontWeight="600">Wave</Typo>
            </View>
            <View style={styles.sourcePill}>
              <View style={[styles.sourceDot, { backgroundColor: '#fff' }]} />
              <Typo size={10} color={colors.textLight} fontWeight="600">Cash</Typo>
            </View>
          </View>

          <View style={styles.capacityRow}>
            <LIcon icon={icons.star} size={14} color={colors.primary} />
            <Typo size={11} color={colors.textLighter} style={{ marginLeft: 6 }}>
              {"Capacité théorique : "}{formatFCFA(theoreticalSavingsCapacity)}/mois
            </Typo>
          </View>
        </LiquidGlass>

        {/* Concentric Circles Gauge */}
        <View style={styles.gaugeContainer}>
          <Typo size={12} fontWeight="800" color={colors.textLighter} style={styles.gaugeTitle}>
            L'ÉQUILIBRE DES 3 CERCLES
          </Typo>
          <GaugeCircles
            vitalProgress={vitalProgress}
            croissanceProgress={cushionProgress}
            plaisirProgress={plaisirProgress}
            animateCroissance={animatePulse}
          />
        </View>

        {/* Active Projects Scroll Section */}
        <View style={styles.activeProjectsSection}>
          <View style={styles.sectionHeader}>
            <Typo size={18} fontWeight="800">
              Projets Actifs
            </Typo>
            <Pressable onPress={() => router.push('/(main)/projects')}>
              <Typo size={13} color={colors.primary} fontWeight="700">
                VOIR TOUT
              </Typo>
            </Pressable>
          </View>

          {activeProjects.length === 0 ? (
            <LiquidGlass intensity={12} style={styles.emptyProjectsCard}>
              <Typo size={14} color={colors.neutral400}>
                Aucun projet actif en cours.
              </Typo>
              <Pressable style={styles.addProjectBtn} onPress={() => router.push('/(main)/projects')}>
                <Typo size={12} color={colors.primary} fontWeight="700">
                  Créer un projet
                </Typo>
              </Pressable>
            </LiquidGlass>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectsScroll}
            >
              {activeProjects.map((p) => {
                const progress = p.targetAmount > 0 ? p.allocatedAmount / p.targetAmount : 0;
                return (
                  <LiquidGlass key={p.id} intensity={12} style={styles.projectMiniCard}>
                    <View style={styles.projectMiniHeader}>
                      <LIcon icon={icons.folder} size={18} color={p.isPlaisir ? '#0ea5e9' : colors.primary} />
                      <View style={styles.projectPriorityBadge}>
                        <Typo size={9} fontWeight="800" color={colors.neutral900}>
                          P{p.priority}
                        </Typo>
                      </View>
                    </View>
                    <Typo size={14} fontWeight="800" textProps={{ numberOfLines: 1 }} style={styles.projectMiniName}>
                      {p.name}
                    </Typo>
                    <Typo size={11} color={colors.textLight} style={{ marginVertical: 4 }}>
                      {formatFCFA(p.allocatedAmount)} / {formatFCFA(p.targetAmount)}
                    </Typo>
                    <View style={styles.projectProgressBg}>
                      <View
                        style={[
                          styles.projectProgressFill,
                          {
                            width: `${Math.min(100, progress * 100)}%`,
                            backgroundColor: p.isPlaisir ? '#0ea5e9' : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Typo size={10} color={colors.textLighter} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                      {Math.round(progress * 100)}%
                    </Typo>
                  </LiquidGlass>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Local Emergency Cushion Card (Fsécurité) */}
        <LiquidGlass intensity={12} style={[styles.cushionCard, !isCushionFunded && styles.cushionUnfunded]}>
          <View style={styles.cushionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LIcon
                icon={isCushionFunded ? icons.shieldCheck : icons.warning}
                size={22}
                color={isCushionFunded ? colors.primary : colors.rose}
              />
              <Typo size={15} fontWeight="700">
                Coussin de Précaution Local
              </Typo>
            </View>
            <View style={styles.lockContainer}>
              {!isCushionFunded && (
                <View style={styles.lockTag}>
                  <LIcon icon={icons.lock} size={10} color={colors.rose} />
                  <Typo size={9} color={colors.rose} fontWeight="700" style={{ marginLeft: 4 }}>
                    Projets Plaisir Verrouillés
                  </Typo>
                </View>
              )}
            </View>
          </View>

          <Typo size={12} color={colors.textLight} style={{ marginVertical: 8 }}>
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
            <Typo size={13} fontWeight="800">
              {formatFCFA(emergencyCushionAllocated)} constitué
            </Typo>
            <Typo size={12} color={colors.textLighter}>
              {Math.round(cushionProgress * 100)}%
            </Typo>
          </View>
        </LiquidGlass>

        {/* Monthly Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          <LiquidGlass intensity={12} style={styles.summaryItem}>
            <Typo size={11} color={colors.textLight}>
              Cercle Vital (Dépenses)
            </Typo>
            <Typo size={15} fontWeight="800">
              {formatFCFA(vitalSpent)}
            </Typo>
          </LiquidGlass>
          <LiquidGlass intensity={12} style={styles.summaryItem}>
            <Typo size={11} color={colors.textLight}>
              Cercle Plaisir (Dépenses)
            </Typo>
            <Typo size={15} fontWeight="800">
              {formatFCFA(plaisirSpent)}
            </Typo>
          </LiquidGlass>
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
            <LiquidGlass intensity={12} style={styles.emptyContainer}>
              <LIcon icon={icons.note} size={32} color={colors.neutral500} />
              <Typo size={14} color={colors.neutral400} style={{ marginTop: 8 }}>
                Aucune transaction pour le moment.
              </Typo>
            </LiquidGlass>
          ) : (
            <LiquidGlass intensity={12} style={styles.transactionsList}>
              {transactions.slice(0, 3).map((item) => {
                const isIncome = item.type === 'income';
                return (
                  <View key={item.id} style={styles.transactionItem}>
                    <View style={styles.txIconContainer}>
                      <LIcon
                        icon={isIncome ? icons.arrowUp : icons.arrowDown}
                        size={18}
                        color={isIncome ? colors.primary : colors.rose}
                      />
                    </View>
                    <View style={styles.txDetails}>
                      <Typo size={14} fontWeight="700" textProps={{ numberOfLines: 1 }}>
                        {item.description || (isIncome ? 'Flux Entrant' : 'Flux Sortant')}
                      </Typo>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <View style={[styles.circleBadge, {
                          backgroundColor: item.cercle === 'VITAL' ? colors.neutral700 : item.cercle === 'CROISSANCE' ? colors.primaryDark : '#0ea5e9'
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
                    <Typo size={14} fontWeight="800" color={isIncome ? colors.primary : colors.white}>
                      {isIncome ? '+' : '-'} {formatFCFA(item.amount)}
                    </Typo>
                  </View>
                );
              })}
            </LiquidGlass>
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
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerText: {
    marginLeft: 10,
  },
  logoTitle: {
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyBadge: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(14, 165, 233, 0.09)', // Electric Blue
    top: screenHeight * 0.35,
    left: -screenWidth * 0.2,
  },
  bgBlobRose: {
    position: 'absolute',
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
    borderRadius: (screenWidth * 0.65) / 2,
    backgroundColor: 'rgba(239, 68, 68, 0.06)', // Rose
    bottom: 50,
    right: -55,
  },
  balanceCard: {
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    padding: spacingX._20,
    borderRadius: radius._16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
    overflow: 'hidden',
  },
  balanceLabel: {
    letterSpacing: 1.5,
  },
  balanceText: {
    letterSpacing: -1,
  },
  sourcePillsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  gaugeContainer: {
    alignItems: 'center',
    gap: 8,
  },
  gaugeTitle: {
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  activeProjectsSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyProjectsCard: {
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    padding: 20,
    borderRadius: radius._16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  addProjectBtn: {
    backgroundColor: 'rgba(220, 253, 139, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  projectsScroll: {
    gap: 12,
    paddingRight: 15,
  },
  projectMiniCard: {
    width: 170,
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    borderRadius: radius._16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  projectMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectPriorityBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  projectMiniName: {
    marginTop: 8,
  },
  projectProgressBg: {
    height: 5,
    backgroundColor: '#1E1E1E',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  projectProgressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  cushionCard: {
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    padding: spacingX._15,
    borderRadius: radius._16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  cushionUnfunded: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1E1E1E',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
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
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    padding: spacingX._12,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    padding: 30,
    borderRadius: radius._16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  transactionsList: {
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    borderRadius: radius._16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
    width: 36,
    height: 36,
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
