import { type TranslationKey } from './ru';

export const en: Record<TranslationKey, string> = {
  // Navigation
  'nav.appName': 'Finance Tracker',
  'nav.dashboard': 'Dashboard',
  'nav.transactions': 'Transactions',
  'nav.statistics': 'Statistics',

  // Header
  'header.openMenu': 'Open menu',
  'header.toggleTheme': 'Toggle theme',
  'header.userMenu': 'User menu',
  'header.logout': 'Log out',
  'header.currency': 'Currency',
  'header.language': 'Language',

  // Auth — Login
  'auth.loginTitle': 'Sign In',
  'auth.loginDescription': 'Enter your credentials to sign in',
  'auth.loginButton': 'Sign In',
  'auth.loginPending': 'Signing in...',
  'auth.noAccount': "Don't have an account?",
  'auth.registerLink': 'Register',

  // Auth — Register
  'auth.registerTitle': 'Create Account',
  'auth.registerDescription': 'Enter your details to create an account',
  'auth.registerButton': 'Create Account',
  'auth.registerPending': 'Creating...',
  'auth.hasAccount': 'Already have an account?',
  'auth.loginLink': 'Sign In',

  // Auth — Fields
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.name': 'Name',
  'auth.namePlaceholder': 'Your name',
  'auth.passwordHint': 'At least 8 characters',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.loadError': 'Failed to load data. Please refresh the page.',
  'dashboard.totalIncome': 'Total Income',
  'dashboard.totalExpenses': 'Total Expenses',
  'dashboard.balance': 'Balance',
  'dashboard.recentTransactions': 'Recent Transactions',
  'dashboard.viewAll': 'View all',
  'dashboard.noTransactions': 'No transactions yet',
  'dashboard.expensesByCategory': 'Expenses by Category',
  'dashboard.noExpenseData': 'No expense data',

  // Transactions page
  'transactions.title': 'Transactions',
  'transactions.export': 'Export',
  'transactions.add': 'Add Transaction',
  'transactions.loadError': 'Failed to load transactions. Please refresh the page.',
  'transactions.empty': 'No transactions found',
  'transactions.emptyHint': 'Add your first transaction or change the filters.',

  // Transaction filters
  'filter.all': 'All',
  'filter.income': 'Income',
  'filter.expense': 'Expenses',
  'filter.dateFrom': 'From',
  'filter.dateTo': 'To',
  'filter.category': 'Category',
  'filter.allCategories': 'All categories',
  'filter.reset': 'Clear',

  // Transaction table
  'table.date': 'Date',
  'table.description': 'Description',
  'table.category': 'Category',
  'table.type': 'Type',
  'table.amount': 'Amount',
  'table.actions': 'Actions',
  'table.edit': 'Edit',
  'table.delete': 'Delete',
  'table.income': 'Income',
  'table.expense': 'Expense',

  // Transaction pagination
  'pagination.info': 'Page {page} of {totalPages} ({total} total)',
  'pagination.prev': 'Previous',
  'pagination.next': 'Next',

  // Transaction dialog
  'dialog.createTitle': 'Add Transaction',
  'dialog.createDescription': 'Add a new income or expense.',
  'dialog.editTitle': 'Edit Transaction',
  'dialog.editDescription': 'Update transaction details.',

  // Delete dialog
  'delete.title': 'Delete Transaction',
  'delete.confirm': 'Are you sure you want to delete this transaction?',
  'delete.details': '{amount} on {date}',
  'delete.irreversible': 'This action cannot be undone.',
  'delete.cancel': 'Cancel',
  'delete.deleting': 'Deleting...',
  'delete.delete': 'Delete',

  // Transaction form
  'form.type': 'Type',
  'form.expense': 'Expense',
  'form.income': 'Income',
  'form.amount': 'Amount',
  'form.date': 'Date',
  'form.description': 'Description (optional)',
  'form.category': 'Category',
  'form.selectCategory': 'Select a category',
  'form.noCategories': 'No categories available',
  'form.cancel': 'Cancel',
  'form.saving': 'Saving...',
  'form.addTransaction': 'Add Transaction',
  'form.save': 'Save Changes',

  // Statistics
  'statistics.title': 'Statistics',
  'statistics.loadError': 'Failed to load statistics. Please refresh the page.',
  'statistics.byCategory': 'By Category',
  'statistics.expenses': 'Expenses',
  'statistics.income': 'Income',
  'statistics.noExpenseData': 'No expense data for this period',
  'statistics.noIncomeData': 'No income data for this period',
  'statistics.monthlyTrend': 'Monthly Trend',
  'statistics.noTrendData': 'No data',

  // Period selector
  'period.thisMonth': 'This Month',
  'period.3months': '3 Months',
  'period.6months': '6 Months',
  'period.12months': '12 Months',

  // Error boundary
  'error.title': 'Something went wrong',
  'error.description': 'An unexpected error occurred',
  'error.retry': 'Try again',

  // Toast messages
  'toast.loginSuccess': 'Logged in successfully',
  'toast.loginError': 'Login failed',
  'toast.registerSuccess': 'Account created successfully',
  'toast.registerError': 'Registration failed',
  'toast.transactionCreated': 'Transaction created',
  'toast.transactionUpdated': 'Transaction updated',
  'toast.transactionDeleted': 'Transaction deleted',
  'toast.createError': 'Failed to create transaction',
  'toast.updateError': 'Failed to update transaction',
  'toast.deleteError': 'Failed to delete transaction',
  'toast.exportSuccess': 'Transactions exported',
  'toast.exportError': 'Failed to export transactions',

  // API error codes
  'error.AUTH_INVALID_CREDENTIALS': 'Invalid email or password',
  'error.AUTH_EMAIL_EXISTS': 'This email is already registered',
  'error.AUTH_TOKEN_EXPIRED': 'Session expired, please sign in again',
  'error.AUTH_TOKEN_INVALID': 'Invalid token',
  'error.AUTH_UNAUTHORIZED': 'Authorization required',
  'error.CATEGORY_NOT_FOUND': 'Category not found',
  'error.CATEGORY_FORBIDDEN': 'Access denied to this category',
  'error.CATEGORY_DUPLICATE': 'Category with this name already exists',
  'error.CATEGORY_HAS_TRANSACTIONS': 'Cannot delete category with transactions',
  'error.TRANSACTION_NOT_FOUND': 'Transaction not found',
  'error.TRANSACTION_FORBIDDEN': 'Access denied to this transaction',
  'error.VALIDATION_ERROR': 'Validation error',
  'error.INTERNAL_ERROR': 'Internal server error',
  'error.RATE_LIMIT_EXCEEDED': 'Too many requests',

  // Validation messages
  'validation.amountRequired': 'Amount is required',
  'validation.amountInvalid': 'Enter a valid amount',
  'validation.amountPositive': 'Amount must be positive',
  'validation.typeRequired': 'Type is required',
  'validation.categoryRequired': 'Category is required',
  'validation.dateRequired': 'Date is required',
  'validation.dateInvalid': 'Enter a valid date',
  'validation.emailInvalid': 'Invalid email address',
  'validation.passwordMin': 'Password must be at least 8 characters',
  'validation.passwordMax': 'Password must be at most 128 characters',
  'validation.passwordRequired': 'Password is required',
  'validation.nameRequired': 'Name is required',
  'validation.nameTooLong': 'Name is too long',

  // Default category names (English names match the DB key)
  'category.Groceries': 'Groceries',
  'category.Dining Out': 'Dining Out',
  'category.Transportation': 'Transportation',
  'category.Housing': 'Housing',
  'category.Utilities': 'Utilities',
  'category.Health': 'Health',
  'category.Entertainment': 'Entertainment',
  'category.Shopping': 'Shopping',
  'category.Education': 'Education',
  'category.Subscriptions': 'Subscriptions',
  'category.Other Expenses': 'Other Expenses',
  'category.Salary': 'Salary',
  'category.Freelance': 'Freelance',
  'category.Investments': 'Investments',
  'category.Gifts': 'Gifts',
  'category.Other Income': 'Other Income',
  // Legacy
  'category.Food & Dining': 'Food & Dining',
  'category.Healthcare': 'Healthcare',
  'category.Personal Care': 'Personal Care',
};
