import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Dimensions, Image, Modal, ActivityIndicator, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { LiquidGlass } from '@/components/LiquidGlass';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import GaugeCircles from '@/components/GaugeCircles';
import Input from '@/components/Input';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import { LIcon, icons } from '@/constants/icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

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
    addTransaction,
  } = useAuth();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(false);

  // Moneroo Deposit Modal States
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [topUpAmountStr, setTopUpAmountStr] = useState('');
  const [topUpSource, setTopUpSource] = useState<'WAVE' | 'ORANGE_MONEY' | 'MOOV' | 'MTN'>('WAVE');
  const [isPaying, setIsPaying] = useState(false);

  // Moneroo Verification Modal States
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState<number>(0);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState(false);
  const [verificationStatusMsg, setVerificationStatusMsg] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

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

  const handleTopUpAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setTopUpAmountStr(numeric);
  };

  const verifyPaymentStatus = async (forced = false) => {
    if (!pendingPaymentId) return;

    if (forced) {
      await addTransaction('income', pendingPaymentAmount, 'CROISSANCE', topUpSource, 'Recharge Moneroo');
      setTopUpAmountStr('');
      setVerificationSuccess(true);
      setVerificationStatusMsg('Paiement forcé (Mode Démo). Votre solde disponible a été rechargé.');
      return;
    }

    setVerifyingStatus(true);
    setVerificationStatusMsg(null);

    try {
      const key = 'pvk_sandbox_nv3d3a|01KVPC0YPDYF4PSHBN9T87ZMBS';
      
      const response = await fetch(`https://api.moneroo.io/v1/payments/${pendingPaymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        }
      });

      const responseJson = await response.json();
      console.log('Verification response:', responseJson);

      if (response.status === 200 && responseJson.data) {
        const status = responseJson.data.status;
        if (status === 'success') {
          await addTransaction('income', pendingPaymentAmount, 'CROISSANCE', topUpSource, 'Recharge Moneroo');
          setTopUpAmountStr('');
          setVerificationSuccess(true);
          setVerificationStatusMsg('Paiement confirmé avec succès par Moneroo ! Votre solde disponible a été crédité.');
        } else if (status === 'initiated' || status === 'pending') {
          setVerificationStatusMsg(`Le paiement est en cours de traitement (Statut : ${status}). Veuillez patienter ou forcer le crédit.`);
        } else {
          setVerificationStatusMsg(`Le paiement a échoué ou a été annulé (Statut : ${status}).`);
        }
      } else {
        setVerificationStatusMsg(`Erreur Moneroo : ${responseJson.message || 'Impossible de récupérer le statut.'}`);
      }
    } catch (error) {
      console.error(error);
      setVerificationStatusMsg('Impossible de contacter la passerelle Moneroo pour vérifier le statut. Option de forçage disponible.');
    } finally {
      setVerifyingStatus(false);
    }
  };

  const handleTopUpSubmit = async () => {
    const amount = parseInt(topUpAmountStr.replace(/\s/g, '')) || 0;
    if (amount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }

    setIsPaying(true);

    try {
      const key = 'pvk_sandbox_nv3d3a|01KVPC0YPDYF4PSHBN9T87ZMBS';
      
      let initResponse = await fetch('https://api.moneroo.io/v1/payments/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'XOF',
          description: `Recharge Pursio via ${topUpSource.replace('_', ' ')}`,
          customer: {
            email: user?.email || 'client@pursio.io',
            first_name: user?.name || 'Client',
            last_name: 'Pursio'
          },
          return_url: 'https://example.com/payment-complete',
          methods: [topUpSource.toLowerCase()]
        })
      });

      let responseJson = await initResponse.json();

      // If XOF fails (e.g. sandbox only allows USD setup by default), auto-fallback converting dynamically to USD
      if (initResponse.status === 400 && responseJson.message && responseJson.message.includes('No payment methods')) {
        console.log('XOF not configured on sandbox account. Retrying with USD conversion fallback.');
        
        // 1 USD = 600 FCFA conversion rate for the demo/sandbox environment
        const amountUSD = Math.round(amount / 600) || 1;

        initResponse = await fetch('https://api.moneroo.io/v1/payments/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountUSD,
            currency: 'USD',
            description: `[DÉMO SANDBOX FCFA-USD] Recharge Pursio via ${topUpSource.replace('_', ' ')}`,
            customer: {
              email: user?.email || 'client@pursio.io',
              first_name: user?.name || 'Client',
              last_name: 'Pursio'
            },
            return_url: 'https://example.com/payment-complete'
          })
        });

        responseJson = await initResponse.json();
      }

      if (initResponse.status === 201 && responseJson.data && responseJson.data.checkout_url) {
        const paymentId = responseJson.data.id;
        setPendingPaymentId(paymentId);
        setPendingPaymentAmount(amount);
        setTopUpModalVisible(false);

        // Open payment checkout in system browser
        await WebBrowser.openBrowserAsync(responseJson.data.checkout_url);
        
        // Open verification modal
        setVerificationSuccess(false);
        setVerificationStatusMsg(null);
        setVerificationModalVisible(true);
      } else {
        Alert.alert('Erreur', responseJson.message || 'Impossible d\'initialiser la transaction.');
        setIsPaying(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de joindre la passerelle de paiement Moneroo.');
      setIsPaying(false);
    }
  };

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
          <View style={styles.balanceHeaderRow}>
            <View>
              <Typo size={12} color={colors.textLighter} fontWeight="700" style={styles.balanceLabel}>
                SOLDE TOTAL
              </Typo>
              <Typo size={34} fontWeight="800" color={colors.primary} style={styles.balanceText}>
                {formatFCFA(totalBalance)}
              </Typo>
            </View>
            
            <Pressable style={styles.rechargerBtn} onPress={() => setTopUpModalVisible(true)}>
              <LIcon icon={icons.wallet} size={14} color={colors.neutral900} />
              <Typo size={11} color={colors.neutral900} fontWeight="800" style={{ marginLeft: 5 }}>
                DÉPÔT
              </Typo>
            </Pressable>
          </View>
          
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

      {/* Moneroo Top-up Modal */}
      <Modal
        visible={topUpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isPaying && setTopUpModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <LiquidGlass intensity={40} style={styles.modalContent} tintColor="rgba(10, 10, 10, 0.95)">
            <View style={styles.modalHeader}>
              <Typo size={20} fontWeight="800" style={{ fontFamily: 'Outfit-Bold' }}>
                Recharger mon solde
              </Typo>
              <Pressable onPress={() => !isPaying && setTopUpModalVisible(false)} style={styles.closeBtn}>
                <Typo size={24} fontWeight="800" color={colors.neutral400}>×</Typo>
              </Pressable>
            </View>

            <Typo size={13} color={colors.textLight} style={{ marginVertical: 8 }}>
              Intégration Passerelle Moneroo (Mobile Money)
            </Typo>

            {/* Amount input */}
            <View style={styles.inputGroup}>
              <Typo size={13} fontWeight="600" color={colors.textLighter}>
                Montant à déposer (FCFA)
              </Typo>
              <Input
                placeholder="Ex: 50 000"
                keyboardType="numeric"
                value={topUpAmountStr ? parseInt(topUpAmountStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                onChangeText={handleTopUpAmountChange}
                editable={!isPaying}
                icon={<LIcon icon={icons.dollar} size={18} color={colors.primary} />}
              />
            </View>

            {/* Source Selection */}
            <View style={styles.inputGroup}>
              <Typo size={13} fontWeight="600" color={colors.textLighter}>
                Moyen de paiement Mobile Money
              </Typo>
              <View style={styles.modalSourceGrid}>
                {(['WAVE', 'ORANGE_MONEY', 'MOOV', 'MTN'] as const).map((s) => (
                  <Pressable
                    key={s}
                    disabled={isPaying}
                    style={[
                      styles.modalSourceBtn,
                      topUpSource === s && styles.activeModalSourceBtn,
                      topUpSource === s && s === 'WAVE' && { borderColor: '#00A3E0' },
                      topUpSource === s && s === 'ORANGE_MONEY' && { borderColor: '#FF6600' },
                      topUpSource === s && s === 'MOOV' && { borderColor: '#16a34a' },
                      topUpSource === s && s === 'MTN' && { borderColor: '#eab308' },
                    ]}
                    onPress={() => setTopUpSource(s)}
                  >
                    <Typo
                      size={12}
                      fontWeight="700"
                      color={topUpSource === s ? colors.white : colors.textLight}
                    >
                      {s.replace('_', ' ')}
                    </Typo>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Proceed CTA */}
            <Pressable 
              style={[styles.modalSubmitBtn, isPaying && styles.modalSubmitBtnDisabled]} 
              onPress={handleTopUpSubmit}
              disabled={isPaying}
            >
              {isPaying ? (
                <ActivityIndicator color={colors.neutral900} size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <LIcon icon={icons.checkCircle} size={16} color={colors.neutral900} />
                  <Typo size={14} color={colors.neutral900} fontWeight="800" style={{ marginLeft: 6 }}>
                    INITIALISER LE DÉPÔT
                  </Typo>
                </View>
              )}
            </Pressable>
          </LiquidGlass>
        </View>
      </Modal>

      {/* Moneroo Verification Modal */}
      <Modal
        visible={verificationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!verifyingStatus) {
            setVerificationModalVisible(false);
            setIsPaying(false);
          }
        }}
      >
        <View style={styles.modalBackground}>
          <LiquidGlass intensity={40} style={styles.modalContent} tintColor="rgba(10, 10, 10, 0.95)">
            <View style={styles.modalHeader}>
              <Typo size={20} fontWeight="800" style={{ fontFamily: 'Outfit-Bold' }}>
                Vérification du paiement
              </Typo>
              <Pressable 
                onPress={() => {
                  if (!verifyingStatus) {
                    setVerificationModalVisible(false);
                    setIsPaying(false);
                  }
                }} 
                style={styles.closeBtn}
              >
                <Typo size={24} fontWeight="800" color={colors.neutral400}>×</Typo>
              </Pressable>
            </View>

            <View style={{ marginVertical: 15, gap: 12, alignItems: 'center' }}>
              <LIcon 
                icon={verificationSuccess ? icons.checkCircle : verifyingStatus ? icons.settings : icons.warning} 
                size={44} 
                color={verificationSuccess ? colors.primary : verifyingStatus ? colors.neutral400 : '#0ea5e9'} 
              />
              
              <Typo size={14} color={colors.textLight} style={{ textAlign: 'center', lineHeight: 20 }}>
                Votre recharge Moneroo de <Typo fontWeight="800" color={colors.white}>{formatFCFA(pendingPaymentAmount)}</Typo> via {topUpSource.replace('_', ' ')} a été lancée.
              </Typo>

              {verificationStatusMsg && (
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: 12,
                  borderRadius: radius._12,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                }}>
                  <Typo size={13} color={verificationSuccess ? colors.primary : colors.textLighter} style={{ textAlign: 'center', lineHeight: 18 }}>
                    {verificationStatusMsg}
                  </Typo>
                </View>
              )}
            </View>

            {/* Verification action button */}
            {!verificationSuccess && (
              <View style={{ gap: 10, marginTop: 10 }}>
                <Pressable 
                  style={[styles.modalSubmitBtn, verifyingStatus && styles.modalSubmitBtnDisabled]} 
                  onPress={() => verifyPaymentStatus(false)}
                  disabled={verifyingStatus}
                >
                  {verifyingStatus ? (
                    <ActivityIndicator color={colors.neutral900} size="small" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <LIcon icon={icons.checkCircle} size={16} color={colors.neutral900} />
                      <Typo size={14} color={colors.neutral900} fontWeight="800" style={{ marginLeft: 6 }}>
                        VÉRIFIER LE STATUT RÉEL
                      </Typo>
                    </View>
                  )}
                </Pressable>

                <Pressable 
                  style={[styles.modalSubmitBtn, { backgroundColor: '#2A2A2A', borderColor: '#3A3A3A' }]} 
                  onPress={() => verifyPaymentStatus(true)}
                  disabled={verifyingStatus}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <LIcon icon={icons.shieldCheck} size={16} color={colors.white} />
                    <Typo size={14} color={colors.white} fontWeight="800" style={{ marginLeft: 6 }}>
                      FORCER LA RECHARGE (SANDBOX)
                    </Typo>
                  </View>
                </Pressable>
              </View>
            )}

            {verificationSuccess && (
              <Pressable 
                style={[styles.modalSubmitBtn, { marginTop: 10 }]} 
                onPress={() => {
                  setVerificationModalVisible(false);
                  setIsPaying(false);
                }}
              >
                <Typo size={14} color={colors.neutral900} fontWeight="800">
                  FERMER
                </Typo>
              </Pressable>
            )}
          </LiquidGlass>
        </View>
      </Modal>
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
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rechargerBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: colors.primaryDark,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: radius._16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  closeBtn: {
    padding: 5,
  },
  modalSourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSourceBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral800,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
  },
  activeModalSourceBtn: {
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    marginTop: 10,
    width: '100%',
  },
  modalSubmitBtnDisabled: {
    backgroundColor: colors.disabledBg,
    borderColor: '#222',
  },
  inputGroup: {
    gap: 8,
  },
});
