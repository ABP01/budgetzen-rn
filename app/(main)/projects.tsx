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
import { useAuth, Project } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { formatFCFA } from '@/utils/currency';
import * as Icons from 'phosphor-react-native';

const ProjectsScreen = () => {
  const {
    projects,
    createProject,
    allocateToProject,
    emergencyCushionLimit,
    emergencyCushionAllocated,
    totalBalance,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'allocate'>('list');

  // Form states - Create Project
  const [name, setName] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [priority, setPriority] = useState('1');
  const [isPlaisir, setIsPlaisir] = useState(false);

  // Form states - Allocate Savings
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [allocateStr, setAllocateStr] = useState('');

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
                contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const progress = item.targetAmount > 0 ? item.allocatedAmount / item.targetAmount : 0;
                  const isSystem = item.id === 'emergency-cushion';

                  return (
                    <View style={[styles.projectCard, isSystem && styles.systemCard]}>
                      <View style={styles.projectHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {isSystem ? (
                            <Icons.Shield size={20} color={colors.primary} weight="fill" />
                          ) : item.isPlaisir ? (
                            <Icons.Sparkle size={20} color="#0ea5e9" weight="fill" />
                          ) : (
                            <Icons.FolderSimpleStar size={20} color={colors.primary} weight="fill" />
                          )}
                          <Typo size={16} fontWeight="800">
                            {item.name}
                          </Typo>
                        </View>

                        {/* Lock overlay for Plaisir projects if cushion is not funded */}
                        {item.isPlaisir && !isCushionFunded && (
                          <View style={styles.lockBadge}>
                            <Icons.Lock size={12} color={colors.rose} weight="fill" />
                            <Typo size={10} color={colors.rose} fontWeight="700" style={{ marginLeft: 4 }}>
                              Bloqué
                            </Typo>
                          </View>
                        )}

                        {!item.isPlaisir && (
                          <View style={styles.cercleBadge}>
                            <Typo size={9} fontWeight="700" color={colors.neutral900}>
                              {isSystem ? 'SÉCURITÉ' : 'CROISSANCE'}
                            </Typo>
                          </View>
                        )}
                      </View>

                      <View style={styles.projectGoalRow}>
                        <Typo size={13} color={colors.textLight}>
                          Cible : {formatFCFA(item.targetAmount)}
                        </Typo>
                        <Typo size={13} color={colors.neutral400}>
                          Priorité {item.priority}
                        </Typo>
                      </View>

                      {/* Progress bar */}
                      <View style={styles.progressBg}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(100, progress * 100)}%`,
                              backgroundColor: isSystem ? (isCushionFunded ? colors.primary : colors.rose) : colors.primary,
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.projectFooter}>
                        <Typo size={14} fontWeight="800">
                          {formatFCFA(item.allocatedAmount)} alloué
                        </Typo>
                        <Typo size={13} color={colors.textLighter}>
                          {Math.round(progress * 100)}%
                        </Typo>
                      </View>
                    </View>
                  );
                }}
              />
            ) : activeTab === 'allocate' ? (
              // ALLOCATE SAVINGS FORM
              <ScrollView contentContainerStyle={styles.formScroll}>
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
                            {isLocked && <Icons.Lock size={16} color={colors.rose} weight="fill" />}
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
                    icon={<Icons.ArrowsDownUp size={22} color={colors.primary} weight="bold" />}
                  />
                </View>

                {/* Validation Callout for locks */}
                {!isCushionFunded && (
                  <View style={styles.lockAlertCard}>
                    <Icons.Warning size={20} color={colors.rose} weight="fill" />
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
              <ScrollView contentContainerStyle={styles.formScroll}>
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
                    icon={<Icons.Tag size={22} color={colors.primary} />}
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
                    icon={<Icons.Coins size={22} color={colors.primary} weight="fill" />}
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
                        {!isCushionFunded && <Icons.Lock size={14} color={colors.neutral600} weight="fill" />}
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
    borderRadius: 12,
    padding: 4,
    marginVertical: verticalScale(15),
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  projectCard: {
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 8,
  },
  systemCard: {
    borderColor: 'rgba(220, 253, 139, 0.3)',
    backgroundColor: '#0F110B',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cercleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectGoalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#151515',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
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
    borderRadius: 10,
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
    borderRadius: 10,
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
    borderRadius: 12,
  },
});
