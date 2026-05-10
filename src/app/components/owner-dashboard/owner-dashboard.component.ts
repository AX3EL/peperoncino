import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { Booking } from '../../models/product.model';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss'
})
export class OwnerDashboardComponent {
  store = inject(StoreService);

  selectedStatus = signal<string>('all');
  expandedId = signal<string | null>(null);
  productsExpanded = signal<boolean>(false);
  productSearchTerm = signal<string>('');

  filteredProducts = computed(() => {
    const term = this.productSearchTerm().toLowerCase();
    const products = this.store.products();
    if (!term) return products;
    return products.filter(p => p.name.toLowerCase().includes(term));
  });

  filteredBookings = computed(() => {
    const status = this.selectedStatus();
    const bookings = this.store.bookings();
    if (status === 'all') return bookings;
    return bookings.filter(b => b.status === status);
  });

  statusLabel: Record<string, string> = {
    pending: 'In attesa',
    confirmed: 'Confermata',
    ready: 'Pronta',
    completed: 'Ritirata'
  };

  statusIcon: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    ready: '📦',
    completed: '🏁'
  };

  nextStatus: Record<string, Booking['status']> = {
    pending: 'confirmed',
    confirmed: 'ready',
    ready: 'completed',
    completed: 'completed'
  };

  nextStatusLabel: Record<string, string> = {
    pending: 'Conferma',
    confirmed: 'Segna come Pronta',
    ready: 'Segna come Ritirata',
    completed: ''
  };

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  // New: allow owner to toggle product availability
  toggleProductAvailability(productId: number) {
    this.store.toggleProductAvailability(productId);
  }

  deleteBooking(id: string, event: Event) {
    event.stopPropagation(); // Evita di espandere la card
    if (confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
      this.store.deleteBooking(id);
    }
  }

  advanceStatus(booking: Booking) {
    const next = this.nextStatus[booking.status];
    if (next !== booking.status) {
      this.store.updateBookingStatus(booking.id, next);
    }
  }

  get stats() {
    const bookings = this.store.bookings();
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      ready: bookings.filter(b => b.status === 'ready').length,
      todayRevenue: bookings
        .filter(b => b.status !== 'completed')
        .reduce((s, b) => s + b.total, 0)
    };
  }
}
