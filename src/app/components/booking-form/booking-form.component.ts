import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent {
  store = inject(StoreService);
  confirmed = output<string>();
  back = output<void>();

  name = signal('');
  surname = signal('');
  phone = signal('');
  errors: Record<string, string> = {};

  validate(): boolean {
    this.errors = {};
    if (!this.name().trim()) this.errors['name'] = 'Il nome è obbligatorio';
    if (!this.surname().trim()) this.errors['surname'] = 'Il cognome è obbligatorio';
    if (!this.phone().trim()) {
      this.errors['phone'] = 'Il numero è obbligatorio';
    } else if (!/^[\d\s\+\-]{9,}$/.test(this.phone())) {
      this.errors['phone'] = 'Inserisci un numero valido';
    }
    return Object.keys(this.errors).length === 0;
  }

  submit() {
    if (!this.validate()) return;
    const booking = this.store.confirmBooking(
      this.name().trim(),
      this.surname().trim(),
      this.phone().trim()
    );
    this.confirmed.emit(booking.id);
  }
}
