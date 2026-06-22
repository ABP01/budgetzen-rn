/**
 * Centralized Lineicons mapping for the entire Pursio app.
 * Import icons from here instead of directly from @lineiconshq/free-icons.
 * 
 * Usage:
 *   import { LIcon, icons } from '@/constants/icons';
 *   <LIcon icon={icons.home} size={24} color="#fff" />
 */

export { Lineicons as LIcon } from '@lineiconshq/react-native-lineicons';

// Import all icons used across the app
import {
  // Navigation
  Home2Solid,
  Home2Stroke,
  Wallet1Solid,
  Wallet1Stroke,
  BarChart4Solid,
  BarChart4Stroke,
  User4Solid,
  User4Stroke,

  // Dashboard
  Bell1Stroke,
  Bell1Solid,
  Shield2CheckSolid,
  Shield2CheckStroke,
  TrendDown1Stroke,
  TrendUp1Stroke,

  // Transactions
  ArrowUpwardSolid,
  ArrowUpwardStroke,
  ArrowDownwardSolid,
  ArrowDownwardStroke,
  DollarCircleSolid,
  DollarCircleStroke,
  Notebook1Stroke,

  // Projects
  Folder1Solid,
  Folder1Stroke,
  StarFatSolid,
  StarFatStroke,
  HeartSolid,
  HeartStroke,

  // Auth & Profile
  Envelope1Stroke,
  Locked1Solid,
  Locked1Stroke,
  ExitStroke,

  // Common
  ChevronLeftStroke,
  Gear1Solid,
  Gear1Stroke,
  Calculator1Solid,
  Calculator1Stroke,
  Search1Stroke,
  CheckCircle1Solid,
  CheckCircle1Stroke,
  Ban2Solid,
  Ban2Stroke,

  // Categories
  Cart1Solid,
  Buildings1Solid,
  Bulb2Solid,
  Car2Solid,
  CameraMovie1Solid,
  CoffeeCup2Solid,
  Diamonds1Solid,
} from '@lineiconshq/free-icons';

// Re-export as a flat object for easy access
export const icons = {
  // Tab bar
  home: Home2Solid,
  homeOutline: Home2Stroke,
  wallet: Wallet1Solid,
  walletOutline: Wallet1Stroke,
  chart: BarChart4Solid,
  chartOutline: BarChart4Stroke,
  user: User4Solid,
  userOutline: User4Stroke,

  // Dashboard  
  bell: Bell1Solid,
  bellOutline: Bell1Stroke,
  shieldCheck: Shield2CheckSolid,
  shieldCheckOutline: Shield2CheckStroke,
  trendDown: TrendDown1Stroke,
  trendUp: TrendUp1Stroke,

  // Transactions
  arrowUp: ArrowUpwardSolid,
  arrowUpOutline: ArrowUpwardStroke,
  arrowDown: ArrowDownwardSolid,
  arrowDownOutline: ArrowDownwardStroke,
  dollar: DollarCircleSolid,
  dollarOutline: DollarCircleStroke,
  note: Notebook1Stroke,

  // Projects
  folder: Folder1Solid,
  folderOutline: Folder1Stroke,
  star: StarFatSolid,
  starOutline: StarFatStroke,
  heart: HeartSolid,
  heartOutline: HeartStroke,

  // Auth / Profile
  envelope: Envelope1Stroke,
  lock: Locked1Stroke,
  lockSolid: Locked1Solid,
  userCircle: User4Solid,
  userCircleOutline: User4Stroke,
  exit: ExitStroke,

  // Common
  chevronLeft: ChevronLeftStroke,
  settings: Gear1Solid,
  settingsOutline: Gear1Stroke,
  calculator: Calculator1Solid,
  calculatorOutline: Calculator1Stroke,
  search: Search1Stroke,
  checkCircle: CheckCircle1Solid,
  checkCircleOutline: CheckCircle1Stroke,
  warning: Ban2Solid,
  warningOutline: Ban2Stroke,

  // Categories
  cart: Cart1Solid,
  building: Buildings1Solid,
  bulb: Bulb2Solid,
  car: Car2Solid,
  film: CameraMovie1Solid,
  coffee: CoffeeCup2Solid,
  diamond: Diamonds1Solid,
};
