
export enum TransactionCategory {
  TECH = 'Tech',
  GROCERIES = 'Groceries',
  SALARY = 'Salary',
  DINING = 'Dining',
  SUBSCRIPTION = 'Subscription',
  TRANSPORT = 'Transport',
  SHELTER = 'Shelter',
  WELLNESS = 'Wellness',
  CULTURE = 'Culture'
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  time?: string;
}

export interface SpendingReflection {
  category: TransactionCategory;
  amount: number;
  description: string;
  status: 'on-track' | 'high' | 'low';
  progress: number;
}
