import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, CartItem, Booking } from '../models/product.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private firebase = inject(FirebaseService);

  // Il carrello resta locale (ogni utente ha il suo)
  private _cart = signal<CartItem[]>([]);
  private _currentView = signal<'customer' | 'owner'>('customer');

  cart = this._cart.asReadonly();
  currentView = this._currentView.asReadonly();

  // Prodotti e prenotazioni ora vengono da Firebase (tempo reale!)
  products = this.firebase.products;
  bookings = this.firebase.bookings;

  cartTotal = computed(() =>
    this._cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  cartCount = computed(() =>
    this._cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  constructor() {
    this.initializeDailyCleanup();
  }

  setView(view: 'customer' | 'owner') {
    this._currentView.set(view);
  }

  // ──── PRODOTTI (delegati a Firebase) ────

  toggleProductAvailability(productId: number): void {
    this.firebase.toggleProductAvailability(productId);
  }

  // ──── CARRELLO (resta locale) ────

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

  // ──── PRENOTAZIONI (salvate su Firebase) ────

  confirmBooking(name: string, surname: string, phone: string): Booking {
    const items = [...this._cart()];
    const total = this.cartTotal();
    const bookingId = this.firebase.createBooking(name, surname, phone, items, total);

    // Costruisci l'oggetto Booking da restituire al componente per la conferma
    const booking: Booking = {
      id: bookingId,
      customerName: name,
      customerSurname: surname,
      customerPhone: phone,
      items,
      total,
      date: new Date(),
      status: 'pending'
    };

    this._cart.set([]);
    return booking;
  }

  deleteBooking(id: string) {
    this.firebase.deleteBooking(id);
  }

  updateBookingStatus(id: string, status: Booking['status']) {
    this.firebase.updateBookingStatus(id, status);
  }

  // ──── PULIZIA GIORNALIERA ────

  private initializeDailyCleanup(): void {
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
      this.firebase.cleanupCompletedBookings();
      // Dopo la prima esecuzione, pianifica ogni 24 ore
      setInterval(() => {
        this.firebase.cleanupCompletedBookings();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilCleanup);
  }
}
