import { Injectable, signal, NgZone, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  push,
  update,
  remove,
  onValue,
  Database,
  query,
  orderByChild,
} from 'firebase/database';
import { environment } from '../../environments/environment';
import { Product, Booking, CartItem } from '../models/product.model';
import { INITIAL_PRODUCTS } from '../data/products';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app: FirebaseApp;
  private db: Database;
  private zone = inject(NgZone);

  // Signals aggiornati in tempo reale da Firebase
  private _products = signal<Product[]>([]);
  private _bookings = signal<Booking[]>([]);

  products = this._products.asReadonly();
  bookings = this._bookings.asReadonly();

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.db = getDatabase(this.app);

    this.listenProducts();
    this.listenBookings();
  }

  // ──── LISTENERS (tempo reale) ────

  private listenProducts(): void {
    const productsRef = ref(this.db, 'products');
    onValue(productsRef, (snapshot) => {
      this.zone.run(() => {
        const data = snapshot.val();
        if (data) {
          // Firebase salva come oggetto { "1": {...}, "2": {...} }
          const products: Product[] = Object.values(data);
          this._products.set(products);
        } else {
          // DB vuoto → inizializza con i prodotti di default
          this.seedProducts();
        }
      });
    });
  }

  private listenBookings(): void {
    const bookingsRef = ref(this.db, 'bookings');
    onValue(bookingsRef, (snapshot) => {
      this.zone.run(() => {
        const data = snapshot.val();
        if (data) {
          const bookings: Booking[] = Object.entries(data).map(([key, val]: [string, any]) => ({
            ...val,
            id: key,
            date: new Date(val.date),
          }));
          // Ordina per data decrescente (più recente prima)
          bookings.sort((a, b) => b.date.getTime() - a.date.getTime());
          this._bookings.set(bookings);
        } else {
          this._bookings.set([]);
        }
      });
    });
  }

  // ──── PRODOTTI ────

  /** Popola Firebase con i prodotti iniziali (solo la prima volta) */
  private seedProducts(): void {
    INITIAL_PRODUCTS.forEach((product) => {
      const productRef = ref(this.db, `products/${product.id}`);
      set(productRef, product);
    });
  }

  /** Titolare: cambia disponibilità prodotto */
  toggleProductAvailability(productId: number): void {
    const product = this._products().find(p => p.id === productId);
    if (product) {
      const productRef = ref(this.db, `products/${productId}/available`);
      set(productRef, !product.available);
    }
  }

  // ──── PRENOTAZIONI ────

  /** Cliente: crea una nuova prenotazione */
  createBooking(name: string, surname: string, phone: string, items: CartItem[], total: number): string {
    const bookingsRef = ref(this.db, 'bookings');
    const newRef = push(bookingsRef);
    const bookingId = newRef.key!;

    const booking = {
      id: bookingId,
      customerName: name,
      customerSurname: surname,
      customerPhone: phone,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
      total,
      date: new Date().toISOString(),
      status: 'pending' as const,
    };

    set(newRef, booking);
    return bookingId;
  }

  /** Titolare: elimina manualmente una prenotazione */
  deleteBooking(bookingId: string): void {
    const bookingRef = ref(this.db, `bookings/${bookingId}`);
    remove(bookingRef);
  }

  /** Titolare: avanza lo stato della prenotazione */
  updateBookingStatus(bookingId: string, status: Booking['status']): void {
    const statusRef = ref(this.db, `bookings/${bookingId}/status`);
    set(statusRef, status);
  }

  /** Pulizia: rimuove tutte le prenotazioni "completed" */
  cleanupCompletedBookings(): void {
    const completed = this._bookings().filter(b => b.status === 'completed');
    completed.forEach(b => {
      const bookingRef = ref(this.db, `bookings/${b.id}`);
      remove(bookingRef);
    });
    if (completed.length > 0) {
      console.log(`🧹 Pulizia Firebase: rimossi ${completed.length} ordini ritirati`);
    }
  }
}
