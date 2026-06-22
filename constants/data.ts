import { CategoryType, ExpenseCategoriesType } from "@/types";
import { colors } from "./theme";
import { icons } from "./icons";

export const expenseCategories: ExpenseCategoriesType = {
  groceries: {
    label: "Groceries",
    value: "groceries",
    icon: icons.cart,
    bgColor: "#4B5563",
  },
  rent: {
    label: "Rent",
    value: "rent",
    icon: icons.home,
    bgColor: "#075985",
  },
  utilities: {
    label: "Utilities",
    value: "utilities",
    icon: icons.bulb,
    bgColor: "#ca8a04",
  },
  transportation: {
    label: "Transportation",
    value: "transportation",
    icon: icons.car,
    bgColor: "#b45309",
  },
  entertainment: {
    label: "Entertainment",
    value: "entertainment",
    icon: icons.film,
    bgColor: "#0f766e",
  },
  dining: {
    label: "Dining",
    value: "dining",
    icon: icons.coffee,
    bgColor: "#be185d",
  },
  health: {
    label: "Health",
    value: "health",
    icon: icons.heart,
    bgColor: "#e11d48",
  },
  insurance: {
    label: "Insurance",
    value: "insurance",
    icon: icons.shieldCheck,
    bgColor: "#404040",
  },
  savings: {
    label: "Savings",
    value: "savings",
    icon: icons.dollar,
    bgColor: "#065F46",
  },
  clothing: {
    label: "Clothing",
    value: "clothing",
    icon: icons.cart,
    bgColor: "#7c3aed",
  },
  personal: {
    label: "Personal",
    value: "personal",
    icon: icons.user,
    bgColor: "#a21caf",
  },
  others: {
    label: "Others",
    value: "others",
    icon: icons.settings,
    bgColor: "#525252",
  },
};

export const incomeCategory: CategoryType = {
  label: "Income",
  value: "income",
  icon: icons.dollar,
  bgColor: "#16a34a",
};

export const transactionTypes = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];
