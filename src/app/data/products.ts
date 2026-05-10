import { Product } from '../models/product.model';

export const CATEGORIES: string[] = [
  'Verdura',
  'Latticini',
  'Pane',
  'Conserve',
  'Pasta',
  'Salumi',
  'Frutta',
  'Condimenti',
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Pomodori San Marzano', category: 'Verdura', price: 2.50, unit: 'kg', available: true, emoji: '🍅' },
  { id: 2, name: 'Peperoncino Calabrese', category: 'Verdura', price: 3.00, unit: '100g', available: true, emoji: '🌶️' },
  { id: 3, name: 'Mozzarella di Bufala', category: 'Latticini', price: 4.50, unit: 'pz', available: true, emoji: '🧀' },
  { id: 4, name: 'Pane di Altamura', category: 'Pane', price: 3.20, unit: 'kg', available: true, emoji: '🍞' },
  { id: 5, name: 'Olive Taggiasche', category: 'Conserve', price: 5.00, unit: '250g', available: true, emoji: '🫒' },
  { id: 6, name: 'Pasta di Gragnano', category: 'Pasta', price: 2.80, unit: 'pz', available: true, emoji: '🍝' },
  { id: 7, name: 'Zucchine Romanesche', category: 'Verdura', price: 1.80, unit: 'kg', available: false, emoji: '🥒' },
  { id: 8, name: 'Prosciutto Crudo DOP', category: 'Salumi', price: 6.50, unit: '100g', available: true, emoji: '🥩' },
  { id: 9, name: 'Limoni di Sorrento', category: 'Frutta', price: 1.50, unit: 'kg', available: true, emoji: '🍋' },
  { id: 10, name: 'Olio EVO Biologico', category: 'Condimenti', price: 8.00, unit: '500ml', available: true, emoji: '🫙' },
  { id: 11, name: 'Pecorino Romano', category: 'Latticini', price: 5.50, unit: '200g', available: true, emoji: '🧀' },
  { id: 12, name: 'Melanzane Viola', category: 'Verdura', price: 2.20, unit: 'kg', available: true, emoji: '🍆' },
];
