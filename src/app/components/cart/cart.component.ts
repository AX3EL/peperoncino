import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { BookingFormComponent } from '../booking-form/booking-form.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, BookingFormComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  store = inject(StoreService);
  close = output<void>();
  showForm = signal(false);
  confirmedBookingId = signal<string | null>(null);

  onBookingConfirmed(bookingId: string) {
    this.confirmedBookingId.set(bookingId);
    this.showForm.set(false);
  }

  closeAll() {
    this.confirmedBookingId.set(null);
    this.close.emit();
  }
}
