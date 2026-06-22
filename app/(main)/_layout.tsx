import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';
import { LIcon, icons } from '@/constants/icons';
import { Platform } from 'react-native';
import { verticalScale } from '@/utils/styling';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral400,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? verticalScale(85) : verticalScale(65),
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <LIcon
              icon={focused ? icons.home : icons.homeOutline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            <LIcon
              icon={focused ? icons.wallet : icons.walletOutline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projets',
          tabBarIcon: ({ color, focused }) => (
            <LIcon
              icon={focused ? icons.folder : icons.folderOutline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="predictive"
        options={{
          title: 'Simulateur',
          tabBarIcon: ({ color, focused }) => (
            <LIcon
              icon={focused ? icons.calculator : icons.calculatorOutline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <LIcon
              icon={focused ? icons.user : icons.userOutline}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
