import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem, Booking } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class StoreService {

  private _cart = signal<CartItem[]>([]);
  private _bookings = signal<Booking[]>(this.seedBookings());
  private _currentView = signal<'customer' | 'owner'>('customer');
  private _products = signal<Product[]>([]);

  cart = this._cart.asReadonly();
  bookings = this._bookings.asReadonly();
  currentView = this._currentView.asReadonly();
  products = this._products.asReadonly();

  cartTotal = computed(() =>
    this._cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  cartCount = computed(() =>
    this._cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  private initializeProducts(): Product[] {
    return [
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
  }

  constructor() {
    this._products.set(this.initializeProducts());
    this.initializeDailyCleanup();
  }

  setView(view: 'customer' | 'owner') {
    this._currentView.set(view);
  }

  toggleProductAvailability(productId: number): void {
    const products = this._products();
    const product = products.find(p => p.id === productId);
    if (product) {
      this._products.set(
        products.map(p =>
          p.id === productId
            ? { ...p, available: !p.available }
            : p
        )
      );
    }
  }

  private initializeDailyCleanup(): void {
    // Esegui la pulizia una volta all'avvio se è già passato le 23:00
    this.cleanupCompletedBookings();

    // Calcola il tempo fino alle 23:00 di oggi
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(23, 0, 0, 0);

    let timeUntilCleanup = scheduledTime.getTime() - now.getTime();

    // Se è già passato le 23:00, pianifica per domani
    if (timeUntilCleanup < 0) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
      timeUntilCleanup = scheduledTime.getTime() - now.getTime();
    }

    // Pianifica la pulizia
    setTimeout(() => {
      this.cleanupCompletedBookings();
      // Dopo la prima esecuzione, pianifica ogni 24 ore
      setInterval(() => {
        this.cleanupCompletedBookings();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilCleanup);
  }

  private cleanupCompletedBookings(): void {
    const beforeCount = this._bookings().length;
    this._bookings.set(
      this._bookings().filter(booking => booking.status !== 'completed')
    );
    const afterCount = this._bookings().length;
    if (beforeCount > afterCount) {
      console.log(`🧹 Pulizia completata: rimossi ${beforeCount - afterCount} ordini ritirati`);
    }
  }

  addToCart(product: Product, quantity: number) {
    const current = this._cart();
    const existing = current.find(i => i.product.id === product.id);
    if (existing) {
      this._cart.set(current.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      ));
    } else {
      this._cart.set([...current, { product, quantity }]);
    }
  }

  removeFromCart(productId: number) {
    this._cart.set(this._cart().filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._cart.set(this._cart().map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
  }

  confirmBooking(name: string, surname: string, phone: string): Booking {
    const booking: Booking = {
      id: 'PRC-' + Date.now().toString(36).toUpperCase(),
      customerName: name,
      customerSurname: surname,
      customerPhone: phone,
      items: [...this._cart()],
      total: this.cartTotal(),
      date: new Date(),
      status: 'pending'
    };
    this._bookings.set([booking, ...this._bookings()]);
    this._cart.set([]);
    return booking;
  }

  updateBookingStatus(id: string, status: Booking['status']) {
    this._bookings.set(this._bookings().map(b => b.id === id ? { ...b, status } : b));
  }

  private seedBookings(): Booking[] {
    return [];
  }
}
