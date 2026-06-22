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
  Image,
  Modal,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import { LIcon, icons } from '@/constants/icons';
import { LiquidGlass } from '@/components/LiquidGlass';

// Beautiful placeholder covers based on project properties
const getProjectCover = (name: string, isSystem: boolean, isPlaisir: boolean) => {
  const lowercaseName = name.toLowerCase();
  if (isSystem || lowercaseName.includes('coussin') || lowercaseName.includes('securite') || lowercaseName.includes('sécurité')) {
    return 'https://images.unsplash.com/photo-1579621970795-87faff2f9050?w=500&auto=format&fit=crop&q=60'; // Cushion / Safe / Money
  }
  if (lowercaseName.includes('voyage') || lowercaseName.includes('trip') || lowercaseName.includes('vacance') || lowercaseName.includes('lome') || lowercaseName.includes('lomé')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60'; // Travel / Beach
  }
  if (lowercaseName.includes('ordinateur') || lowercaseName.includes('mac') || lowercaseName.includes('phone') || lowercaseName.includes('tech') || lowercaseName.includes('pc')) {
    return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60'; // Tech / Workspace
  }
  if (isPlaisir) {
    return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=60'; // Pleasure / Cinema / Fun
  }
  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'; // Neon abstract
};

const ProjectsScreen = () => {
  const {
    projects,
    createProject,
    allocateToProject,
    deallocateFunds,
    deleteProject,
    emergencyCushionLimit,
    emergencyCushionAllocated,
    totalBalance,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'allocate' | 'add'>('list');

  // Form states - Create Project
  const [name, setName] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [priority, setPriority] = useState('1');
  const [isPlaisir, setIsPlaisir] = useState(false);

  // Form states - Allocate Savings
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [allocateStr, setAllocateStr] = useState('');

  // Project management states
  const [selectedProjectForManage, setSelectedProjectForManage] = useState<any>(null);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [deallocateStr, setDeallocateStr] = useState('');

  const targetAmount = parseInt(targetStr.replace(/\s/g, '')) || 0;
  const allocateAmount = parseInt(allocateStr.replace(/\s/g, '')) || 0;

  const isCushionFunded = emergencyCushionAllocated >= emergencyCushionLimit;

  // Handle dynamic text formatting
  const handleTargetChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setTargetStr(numeric);
  };

  const handleAllocateChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setAllocateStr(numeric);
  };

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le projet.');
      return;
    }
    if (targetAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant cible supérieur à 0.');
      return;
    }

    // US #02 Cushion locking check
    if (isPlaisir && !isCushionFunded) {
      Alert.alert(
        'Création bloquée',
        'Votre coussin de précaution local doit être constitué à 100% avant de pouvoir créer des projets de loisir (Plaisir).'
      );
      return;
    }

    const res = await createProject(name, targetAmount, parseInt(priority) || 1, isPlaisir);
    if (res.success) {
      Alert.alert('Succès', 'Projet créé avec succès !');
      setName('');
      setTargetStr('');
      setPriority('1');
      setIsPlaisir(false);
      setActiveTab('list');
    } else {
      Alert.alert('Erreur', res.error || 'Impossible de créer le projet.');
    }
  };

  const handleAllocate = async () => {
    if (!selectedProjectId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un projet.');
      return;
    }
    if (allocateAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant à allouer.');
      return;
    }

    const selectedProj = projects.find(p => p.id === selectedProjectId);
    if (selectedProj?.isPlaisir && !isCushionFunded) {
      Alert.alert(
        'Allocation bloquée',
        "Votre coussin de précaution local n'est pas entièrement constitué. Toutes les économies disponibles doivent abonder le fonds de sécurité."
      );
      return;
    }

    const res = await allocateToProject(selectedProjectId, allocateAmount);
    if (res.success) {
      Alert.alert('Succès', 'Fonds alloués avec succès !');
      setAllocateStr('');
      setSelectedProjectId('');
      setActiveTab('list');
    } else {
      Alert.alert('Erreur', res.error || "Impossible d'allouer les fonds.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <ScreenWrapper>
          <View style={styles.container}>
            {/* Tab header */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, activeTab === 'list' && styles.activeTab]}
                onPress={() => setActiveTab('list')}
              >
                <Typo
                  size={14}
                  fontWeight="700"
                  color={activeTab === 'list' ? colors.neutral900 : colors.textLight}
                >
                  Projets
                </Typo>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === 'allocate' && styles.activeTab]}
                onPress={() => setActiveTab('allocate')}
              >
                <Typo
                  size={14}
                  fontWeight="700"
                  color={activeTab === 'allocate' ? colors.neutral900 : colors.textLight}
                >
                  Allouer
                </Typo>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === 'add' && styles.activeTab]}
                onPress={() => setActiveTab('add')}
              >
                <Typo
                  size={14}
                  fontWeight="700"
                  color={activeTab === 'add' ? colors.neutral900 : colors.textLight}
                >
                  Créer
                </Typo>
              </Pressable>
            </View>

            {activeTab === 'list' ? (
              // PROJECTS LIST
              <FlatList
                data={projects}
                keyExtractor={item => item.id}
                contentContainerStyle={{ gap: 18, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const progress = item.targetAmount > 0 ? item.allocatedAmount / item.targetAmount : 0;
                  const isSystem = item.id === 'emergency-cushion';
                  const coverUrl = getProjectCover(item.name, isSystem, item.isPlaisir);

                  return (
                    <Pressable
                      style={[styles.projectCard, isSystem && styles.systemCard]}
                      onPress={() => {
                        setSelectedProjectForManage(item);
                        setDeallocateStr('');
                        setManageModalVisible(true);
                      }}
                    >
                      {/* Card Image Header */}
                      <View style={styles.cardImageContainer}>
                        <Image source={{ uri: coverUrl }} style={styles.cardImage} />
                        <View style={styles.imageOverlay} />
                        
                        {/* Overlay elements */}
                        <View style={styles.cardOverlayHeader}>
                          <View style={styles.cardIconBadge}>
                            <LIcon
                              icon={isSystem ? icons.shieldCheck : item.isPlaisir ? icons.star : icons.folder}
                              size={16}
                              color={isSystem ? colors.primary : item.isPlaisir ? '#0ea5e9' : colors.white}
                            />
                          </View>
                          
                          {/* Lock badge for locked plaisir projects */}
                          {item.isPlaisir && !isCushionFunded ? (
                            <View style={styles.lockBadge}>
                              <LIcon icon={icons.lock} size={11} color={colors.rose} />
                              <Typo size={10} color={colors.rose} fontWeight="800" style={{ marginLeft: 4 }}>
                                Verrouillé
                              </Typo>
                            </View>
                          ) : (
                            <View style={[styles.typeBadge, { backgroundColor: isSystem ? 'rgba(220, 253, 139, 0.2)' : item.isPlaisir ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255, 255, 255, 0.15)' }]}>
                              <Typo size={9} fontWeight="800" color={isSystem ? colors.primary : item.isPlaisir ? '#0ea5e9' : colors.white}>
                                {isSystem ? 'SÉCURITÉ' : item.isPlaisir ? 'PLAISIR' : 'CROISSANCE'}
                              </Typo>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Content Section */}
                      <View style={styles.cardContent}>
                        <View style={styles.projectHeaderRow}>
                          <Typo size={16} fontWeight="800">
                            {item.name}
                          </Typo>
                          <Typo size={11} color={colors.textLighter} fontWeight="700">
                            Priorité {item.priority}
                          </Typo>
                        </View>

                        <View style={styles.projectGoalRow}>
                          <Typo size={12} color={colors.textLight}>
                            Cible : {formatFCFA(item.targetAmount)}
                          </Typo>
                        </View>

                        {/* Progress Bar & Percentage Row */}
                        <View style={styles.progressRow}>
                          <View style={styles.progressBg}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${Math.min(100, progress * 100)}%`,
                                  backgroundColor: isSystem ? (isCushionFunded ? colors.primary : colors.rose) : item.isPlaisir ? '#0ea5e9' : colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Typo size={12} fontWeight="800" color={colors.white} style={styles.progressPercent}>
                            {Math.round(progress * 100)}%
                          </Typo>
                        </View>

                        <View style={styles.projectFooter}>
                          <Typo size={14} fontWeight="800" color={colors.primary}>
                            {formatFCFA(item.allocatedAmount)} alloué
                          </Typo>
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
              />
            ) : activeTab === 'allocate' ? (
              // ALLOCATE SAVINGS FORM
              <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
                <Typo size={22} fontWeight="800">
                  {"Allouer de l'épargne"}
                </Typo>
                <Typo size={14} color={colors.textLight}>
                  Solde disponible à répartir :{' '}
                  <Typo fontWeight="800" color={colors.primary}>
                    {formatFCFA(totalBalance)}
                  </Typo>
                </Typo>

                {/* Project Selector list */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Sélectionner un Projet
                  </Typo>
                  <View style={styles.selectorGrid}>
                    {projects.map(p => {
                      const isLocked = p.isPlaisir && !isCushionFunded;
                      return (
                        <Pressable
                          key={p.id}
                          disabled={isLocked}
                          style={[
                            styles.selectorCard,
                            selectedProjectId === p.id && styles.activeSelectorCard,
                            isLocked && styles.lockedSelectorCard,
                          ]}
                          onPress={() => setSelectedProjectId(p.id)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typo
                              size={14}
                              fontWeight="700"
                              color={isLocked ? colors.neutral500 : selectedProjectId === p.id ? colors.neutral900 : colors.white}
                            >
                              {p.name}
                            </Typo>
                            {isLocked && <LIcon icon={icons.lock} size={14} color={colors.rose} />}
                          </View>
                          <Typo
                            size={11}
                            color={isLocked ? colors.neutral600 : selectedProjectId === p.id ? colors.neutral800 : colors.textLight}
                            style={{ marginTop: 4 }}
                          >
                            Cible : {formatFCFA(p.targetAmount)} ({Math.round((p.allocatedAmount / p.targetAmount) * 100)}% financé)
                          </Typo>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Amount to allocate */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Montant à transférer (FCFA)
                  </Typo>
                  <Input
                    placeholder="Ex: 50 000"
                    keyboardType="numeric"
                    value={allocateStr ? parseInt(allocateStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                    onChangeText={handleAllocateChange}
                    icon={<LIcon icon={icons.settings} size={18} color={colors.primary} />}
                  />
                </View>

                {/* Validation Callout for locks */}
                {!isCushionFunded && (
                  <View style={styles.lockAlertCard}>
                    <LIcon icon={icons.warning} size={18} color={colors.rose} />
                    <Typo size={12} color={colors.textLight} style={{ marginLeft: 8, flex: 1, lineHeight: 16 }}>
                      {"Votre coussin de précaution local n'est pas entièrement constitué. Le versement vers des projets de loisir (Plaisir) est verrouillé."}
                    </Typo>
                  </View>
                )}

                <Button onPress={handleAllocate}>
                  <Typo color={colors.neutral900} fontWeight="700">
                    {"Confirmer l'allocation"}
                  </Typo>
                </Button>
              </ScrollView>
            ) : (
              // CREATE PROJECT FORM
              <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
                <Typo size={22} fontWeight="800">
                  Créer un projet
                </Typo>

                {/* Project Name */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Nom du Projet
                  </Typo>
                  <Input
                    placeholder="Ex: Achat Ordinateur, Voyage à Lomé"
                    value={name}
                    onChangeText={setName}
                    icon={<LIcon icon={icons.note} size={20} color={colors.primary} />}
                  />
                </View>

                {/* Target Amount */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Montant Cible (FCFA)
                  </Typo>
                  <Input
                    placeholder="Ex: 1 500 000"
                    keyboardType="numeric"
                    value={targetStr ? parseInt(targetStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                    onChangeText={handleTargetChange}
                    icon={<LIcon icon={icons.dollar} size={20} color={colors.primary} />}
                  />
                </View>

                {/* Priority Selection */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    {"Priorité (Ordre d'importance)"}
                  </Typo>
                  <View style={styles.prioritySelector}>
                    {['1', '2', '3'].map(p => (
                      <Pressable
                        key={p}
                        style={[styles.priorityBtn, priority === p && styles.activePriorityBtn]}
                        onPress={() => setPriority(p)}
                      >
                        <Typo
                          size={13}
                          fontWeight="700"
                          color={priority === p ? colors.neutral900 : colors.textLighter}
                        >
                          Priorité {p}
                        </Typo>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Project Type Switch (Croissance vs Plaisir) */}
                <View style={styles.inputGroup}>
                  <Typo size={14} fontWeight="600" color={colors.textLight}>
                    Cercle Associé
                  </Typo>
                  <View style={styles.circleSelector}>
                    <Pressable
                      style={[styles.circleBtn, !isPlaisir && styles.activeCircleBtn]}
                      onPress={() => setIsPlaisir(false)}
                    >
                      <Typo
                        size={13}
                        fontWeight="700"
                        color={!isPlaisir ? colors.neutral900 : colors.textLighter}
                      >
                        Croissance (Investissement/Actif)
                      </Typo>
                    </Pressable>

                    <Pressable
                      disabled={!isCushionFunded}
                      style={[
                        styles.circleBtn,
                        isPlaisir && styles.activeCircleBtn,
                        !isCushionFunded && styles.disabledCircleBtn,
                      ]}
                      onPress={() => setIsPlaisir(true)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Typo
                          size={13}
                          fontWeight="700"
                          color={!isCushionFunded ? colors.neutral600 : isPlaisir ? colors.neutral900 : colors.textLighter}
                        >
                          Plaisir (Loisirs/Optionnel)
                        </Typo>
                        {!isCushionFunded && <LIcon icon={icons.lock} size={14} color={colors.neutral600} />}
                      </View>
                    </Pressable>
                  </View>

                  {!isCushionFunded && (
                    <Typo size={12} color={colors.rose} style={{ marginTop: 4 }}>
                      {"⚠️ Le cercle Plaisir est verrouillé car le coussin de sécurité n'est pas rempli à 100%."}
                    </Typo>
                  )}
                </View>

                <Button onPress={handleCreate}>
                  <Typo color={colors.neutral900} fontWeight="700">
                    Ajouter le Projet
                  </Typo>
                </Button>
              </ScrollView>
            )}
          </View>
        </ScreenWrapper>

        {/* Manage Project Modal */}
        <Modal
          visible={manageModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setManageModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <LiquidGlass intensity={40} style={styles.modalContent} tintColor="rgba(10, 10, 10, 0.95)">
              <View style={styles.modalHeader}>
                <Typo size={20} fontWeight="800" style={{ fontFamily: 'Outfit-Bold' }}>
                  Gérer le projet
                </Typo>
                <Pressable onPress={() => setManageModalVisible(false)} style={styles.closeBtn}>
                  <Typo size={24} fontWeight="800" color={colors.neutral400}>×</Typo>
                </Pressable>
              </View>

              {selectedProjectForManage && (
                <ScrollView contentContainerStyle={{ gap: 16, paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
                  {/* Project Info Summary */}
                  <View style={{ gap: 6 }}>
                    <Typo size={18} fontWeight="800" color={colors.primary}>
                      {selectedProjectForManage.name}
                    </Typo>
                    <Typo size={12} color={colors.textLight}>
                      Cible : {formatFCFA(selectedProjectForManage.targetAmount)} | Alloué : {formatFCFA(selectedProjectForManage.allocatedAmount)}
                    </Typo>
                    
                    {/* Progress bar */}
                    <View style={styles.progressRow}>
                      <View style={styles.progressBg}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(100, (selectedProjectForManage.allocatedAmount / selectedProjectForManage.targetAmount) * 100)}%`,
                              backgroundColor: selectedProjectForManage.id === 'emergency-cushion' ? colors.primary : selectedProjectForManage.isPlaisir ? '#0ea5e9' : colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Typo size={12} fontWeight="800" color={colors.white}>
                        {Math.round((selectedProjectForManage.allocatedAmount / selectedProjectForManage.targetAmount) * 100)}%
                      </Typo>
                    </View>
                  </View>

                  {/* Deallocate funds input group */}
                  {selectedProjectForManage.allocatedAmount > 0 && (
                    <View style={styles.inputGroup}>
                      <Typo size={13} fontWeight="600" color={colors.textLighter}>
                        Retirer de l'épargne allouée (FCFA)
                      </Typo>
                      <Input
                        placeholder="Ex: 10 000"
                        keyboardType="numeric"
                        value={deallocateStr ? parseInt(deallocateStr).toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                        onChangeText={(text) => setDeallocateStr(text.replace(/[^0-9]/g, ''))}
                        icon={<LIcon icon={icons.calculator} size={18} color={colors.rose} />}
                      />
                      <Pressable
                        style={[styles.modalSubmitBtn, { backgroundColor: colors.rose, borderColor: colors.rose, marginTop: 8 }]}
                        onPress={async () => {
                          const amount = parseInt(deallocateStr) || 0;
                          if (amount <= 0) {
                            Alert.alert('Erreur', 'Veuillez saisir un montant valide.');
                            return;
                          }
                          const res = await deallocateFunds(selectedProjectForManage.id, amount);
                          if (res.success) {
                            Alert.alert('Succès', `${formatFCFA(amount)} retirés avec succès.`);
                            setDeallocateStr('');
                            setManageModalVisible(false);
                          } else {
                            Alert.alert('Erreur', res.error || 'Impossible de retirer les fonds.');
                          }
                        }}
                      >
                        <Typo size={14} color={colors.neutral900} fontWeight="800">
                          RETIRER LES FONDS
                        </Typo>
                      </Pressable>
                    </View>
                  )}

                  {/* Delete button (only if not emergency cushion system project) */}
                  {selectedProjectForManage.id !== 'emergency-cushion' && (
                    <View style={{ marginTop: 10 }}>
                      <Pressable
                        style={[styles.modalSubmitBtn, { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                        onPress={() => {
                          Alert.alert(
                            'Supprimer le projet',
                            `Êtes-vous sûr de vouloir supprimer "${selectedProjectForManage.name}" ? Les ${formatFCFA(selectedProjectForManage.allocatedAmount)} alloués retourneront dans votre solde libre disponible.`,
                            [
                              { text: 'Annuler', style: 'cancel' },
                              {
                                text: 'Supprimer',
                                style: 'destructive',
                                onPress: async () => {
                                  await deleteProject(selectedProjectForManage.id);
                                  setManageModalVisible(false);
                                  Alert.alert('Succès', 'Le projet a été supprimé.');
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <LIcon icon={icons.warning} size={16} color={colors.white} />
                          <Typo size={14} color={colors.white} fontWeight="800" style={{ marginLeft: 6 }}>
                            SUPPRIMER LE PROJET
                          </Typo>
                        </View>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              )}
            </LiquidGlass>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ProjectsScreen;

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
  projectCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
  },
  systemCard: {
    borderColor: 'rgba(220, 253, 139, 0.25)',
  },
  cardImageContainer: {
    height: 110,
    position: 'relative',
    width: '100%',
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardOverlayHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  projectHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectGoalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#151515',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    width: 35,
    textAlign: 'right',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  formScroll: {
    gap: spacingY._20,
    paddingBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  prioritySelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral800,
    padding: 4,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius._10,
  },
  activePriorityBtn: {
    backgroundColor: colors.primary,
  },
  circleSelector: {
    flexDirection: 'column',
    gap: 8,
  },
  circleBtn: {
    backgroundColor: colors.neutral800,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  activeCircleBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledCircleBtn: {
    backgroundColor: '#101010',
    borderColor: '#151515',
  },
  selectorGrid: {
    gap: 8,
  },
  selectorCard: {
    backgroundColor: colors.neutral800,
    padding: 12,
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  activeSelectorCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  lockedSelectorCard: {
    backgroundColor: '#101010',
    borderColor: '#151515',
    opacity: 0.6,
  },
  lockAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 12,
    borderRadius: radius._12,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    padding: spacingX._20,
    borderRadius: radius._16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeBtn: {
    padding: 4,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
