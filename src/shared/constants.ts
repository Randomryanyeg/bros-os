
import { ScotiaAccountMap } from './types';

export const EDMONTON_EMPLOYERS = [
  "GOVERNMENT OF ALBERTA",
  "UNIVERSITY OF ALBERTA",
  "PCL CONSTRUCTION",
  "CITY OF EDMONTON",
  "STANTEC CONSULTING",
  "ALBERTA HEALTH SERVICES"
];

export const EDMONTON_BILLERS = [
  "EPCOR - UTILITIES",
  "CITY OF EDMONTON - TAX",
  "TELUS COMMUNICATIONS",
  "ROGERS MOBILE",
  "ENMAX ENERGY",
  "AMERICAN EXPRESS"
];

export const EDMONTON_MERCHANTS = [
  "WEST EDMONTON MALL",
  "DUCHESS BAKE SHOP",
  "OODLE NOODLE",
  "CORSO 32",
  "ROGERS PLACE",
  "SAVE-ON-FOODS",
  "SAFEWAY",
  "PETRO-CANADA",
  "ETS - EDMONTON TRANSIT",
  "REMEDY CAFE",
  "HUDSON'S BAY",
  "ROOTS"
];

export const getSystemConfig = () => {
  return (window as unknown as { __SCOTIA_CONFIG__: Record<string, unknown> }).__SCOTIA_CONFIG__ ?? {
    scotia_config: {
      account_holder: "ISAAC JOHNSON",
      address: "3037 DRUMLOCH AVE\nOAKVILLE ON\nL5C 3W5"
    },
    general: {
      app_name: "Scotia",
      timezone: "America/Toronto"
    }
  };
};

export const INITIAL_ACCOUNTS: ScotiaAccountMap = {
  'Basic Plus': {
    type: 'banking',
    balance: 7482.05,
    pending: 0,
    available: 7482.05,
    points: 0,
    history: []
  },
  'Momentum PLUS': {
    type: 'banking',
    balance: 18293.03,
    pending: 0,
    available: 18293.03,
    points: 0,
    history: [],
  },
  'Momentum Savings': {
    type: 'banking',
    balance: 3137.16,
    pending: 0,
    available: 3137.16,
    points: 0,
    history: [],
  },
  'Scotiabank Gold Amex Card': {
    type: 'credit',
    balance: 455.00,
    pending: 0,
    available: 14545.00,
    points: 32450,
    history: [],
  },
  'Scotiabank Passport Visa Infinite card': {
    type: 'credit',
    balance: 3769.49,
    pending: 0,
    available: 11230.51,
    points: 12500,
    history: [],
  }
};

export const INITIAL_PAYEES = [
    { id: 'p1', name: 'EPCOR UTILITIES', accountNumber: '10002938475' },
    { id: 'p2', name: 'TELUS MOBILITY', accountNumber: '8392019283' },
    { id: 'p3', name: 'RBC VISA', accountNumber: '4519********2938' }
];
