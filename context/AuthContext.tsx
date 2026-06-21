import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export interface User {
  name: string;
  email: string;
}

export interface Profile {
  monthlyIncome: number;
  vitalExpensesLimit: number;
  isSetupComplete: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number; // in FCFA (integer)
  cercle: 'VITAL' | 'CROISSANCE' | 'PLAISIR';
  source: 'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'MOOV' | 'MTN';
  description: string;
  date: string; // ISO date
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  targetAmount: number;
  allocatedAmount: number;
  priority: number;
  isPlaisir: boolean;
}

interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  transactions: Transaction[];
  projects: Project[];
  loading: boolean;
  login: (email: string, name?: string) => Promise<{ success: boolean; msg?: string }>;
  register: (email: string, name: string) => Promise<{ success: boolean; msg?: string }>;
  logout: () => Promise<void>;
  setupProfile: (monthlyIncome: number, vitalExpensesLimit: number) => Promise<void>;
  addTransaction: (
    type: 'income' | 'expense',
    amount: number,
    cercle: 'VITAL' | 'CROISSANCE' | 'PLAISIR',
    source: 'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'MOOV' | 'MTN',
    description: string
  ) => Promise<void>;
  createProject: (
    name: string,
    targetAmount: number,
    priority: number,
    isPlaisir: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  allocateToProject: (projectId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  emergencyCushionLimit: number;
  emergencyCushionAllocated: number;
  totalBalance: number;
  theoreticalSavingsCapacity: number;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load everything from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@pursio_user');
        const storedProfile = await AsyncStorage.getItem('@pursio_profile');
        const storedTransactions = await AsyncStorage.getItem('@pursio_transactions');
        const storedProjects = await AsyncStorage.getItem('@pursio_projects');

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedProfile) setProfile(JSON.parse(storedProfile));
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        }
      } catch (err) {
        console.error('Failed to load data from storage', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const emergencyCushionLimit = profile ? 3 * profile.vitalExpensesLimit : 0;

  // Calculate emergency cushion allocation
  const emergencyCushionAllocated = projects.find(p => p.id === 'emergency-cushion')?.allocatedAmount || 0;

  // Calculate overall balance: Sum(incomes) - Sum(expenses)
  const totalBalance = transactions.reduce((acc, t) => {
    if (t.type === 'income') return acc + t.amount;
    return acc - t.amount;
  }, 0);

  // Theoretical savings capacity: Monthly Income - Vital Expenses Limit
  const theoreticalSavingsCapacity = profile ? Math.max(0, profile.monthlyIncome - profile.vitalExpensesLimit) : 0;

  const login = async (email: string, name?: string) => {
    const formattedEmail = email.toLowerCase().trim();
    const mockUser: User = {
      email: formattedEmail,
      name: name || formattedEmail.split('@')[0],
    };
    setUser(mockUser);
    await AsyncStorage.setItem('@pursio_user', JSON.stringify(mockUser));

    // Reload profile
    const storedProfile = await AsyncStorage.getItem('@pursio_profile');
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
      if (parsedProfile.isSetupComplete) {
        router.replace('/(main)');
      } else {
        router.replace('/(auth)/setup-profile');
      }
    } else {
      router.replace('/(auth)/setup-profile');
    }
    return { success: true };
  };

  const register = async (email: string, name: string) => {
    const formattedEmail = email.toLowerCase().trim();
    const mockUser: User = {
      email: formattedEmail,
      name: name,
    };
    setUser(mockUser);
    await AsyncStorage.setItem('@pursio_user', JSON.stringify(mockUser));
    router.replace('/(auth)/setup-profile');
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    setTransactions([]);
    setProjects([]);
    await AsyncStorage.removeItem('@pursio_user');
    await AsyncStorage.removeItem('@pursio_profile');
    await AsyncStorage.removeItem('@pursio_transactions');
    await AsyncStorage.removeItem('@pursio_projects');
    router.replace('/(auth)/welcome');
  };

  const setupProfile = async (monthlyIncome: number, vitalExpensesLimit: number) => {
    const newProfile: Profile = {
      monthlyIncome,
      vitalExpensesLimit,
      isSetupComplete: true,
    };
    setProfile(newProfile);
    await AsyncStorage.setItem('@pursio_profile', JSON.stringify(newProfile));

    // Create system emergency cushion project
    const limit = 3 * vitalExpensesLimit;
    const systemCushion: Project = {
      id: 'emergency-cushion',
      name: 'Coussin de Sécurité',
      targetAmount: limit,
      allocatedAmount: 0,
      priority: 1,
      isPlaisir: false,
    };

    // Check if projects already has it, if not, initialize with it
    const updatedProjects = [systemCushion, ...projects.filter(p => p.id !== 'emergency-cushion')];
    setProjects(updatedProjects);
    await AsyncStorage.setItem('@pursio_projects', JSON.stringify(updatedProjects));

    router.replace('/(main)');
  };

  const addTransaction = async (
    type: 'income' | 'expense',
    amount: number,
    cercle: 'VITAL' | 'CROISSANCE' | 'PLAISIR',
    source: 'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'MOOV' | 'MTN',
    description: string
  ) => {
    const integerAmount = Math.round(amount);
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(7),
      type,
      amount: integerAmount,
      cercle,
      source,
      description,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    await AsyncStorage.setItem('@pursio_transactions', JSON.stringify(updatedTransactions));

    // Offline rule US #02: Any incoming flow (income) automatically allocates to emergency cushion if not funded
    if (type === 'income') {
      const cushionLimit = profile ? 3 * profile.vitalExpensesLimit : 0;
      const currentCushion = projects.find(p => p.id === 'emergency-cushion');
      const currentAllocated = currentCushion ? currentCushion.allocatedAmount : 0;

      if (currentAllocated < cushionLimit) {
        const remainingToFund = cushionLimit - currentAllocated;
        const autoAllocateAmount = Math.min(integerAmount, remainingToFund);

        const updatedProjects = projects.map(p => {
          if (p.id === 'emergency-cushion') {
            return { ...p, allocatedAmount: p.allocatedAmount + autoAllocateAmount, targetAmount: cushionLimit };
          }
          return p;
        });
        setProjects(updatedProjects);
        await AsyncStorage.setItem('@pursio_projects', JSON.stringify(updatedProjects));
      }
    }
  };

  const createProject = async (
    name: string,
    targetAmount: number,
    priority: number,
    isPlaisir: boolean
  ) => {
    // US #02 Rule: Block non-essential project creation if cushion is not funded
    if (isPlaisir && emergencyCushionAllocated < emergencyCushionLimit) {
      return {
        success: false,
        error: "Création bloquée : Votre coussin de sécurité local (3 mois de Cercle Vital) doit être constitué à 100% avant de créer des projets Plaisir.",
      };
    }

    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name,
      targetAmount: Math.round(targetAmount),
      allocatedAmount: 0,
      priority,
      isPlaisir,
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    await AsyncStorage.setItem('@pursio_projects', JSON.stringify(updatedProjects));
    return { success: true };
  };

  const allocateToProject = async (projectId: string, amount: number) => {
    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) return { success: false, error: 'Projet introuvable.' };

    // US #02 Rule: Block transfers to Plaisir projects if cushion is not funded
    if (targetProject.isPlaisir && emergencyCushionAllocated < emergencyCushionLimit) {
      return {
        success: false,
        error: "Transfert bloqué : Votre coussin de sécurité local doit être constitué à 100% avant d'alimenter un projet Plaisir.",
      };
    }

    // Verify balance availability
    if (amount > totalBalance && projectId !== 'emergency-cushion') {
      return {
        success: false,
        error: "Solde insuffisant pour cette allocation.",
      };
    }

    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, allocatedAmount: Math.round(p.allocatedAmount + amount) };
      }
      return p;
    });

    setProjects(updatedProjects);
    await AsyncStorage.setItem('@pursio_projects', JSON.stringify(updatedProjects));
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        transactions,
        projects,
        loading,
        login,
        register,
        logout,
        setupProfile,
        addTransaction,
        createProject,
        allocateToProject,
        emergencyCushionLimit,
        emergencyCushionAllocated,
        totalBalance,
        theoreticalSavingsCapacity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
