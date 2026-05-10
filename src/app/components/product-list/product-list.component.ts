import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  store = inject(StoreService);

  selectedCategory = signal<string>('Tutti');
  quantities: Record<number, number> = {};
  addedItems: Record<number, boolean> = {};

  get categories(): string[] {
    const cats = [...new Set(this.store.products.map(p => p.category))];
    return ['Tutti', ...cats];
  }

  get filteredProducts(): Product[] {
    const cat = this.selectedCategory();
    return cat === 'Tutti'
      ? this.store.products
      : this.store.products.filter(p => p.category === cat);
  }

  getQuantity(productId: number): number {
    return this.quantities[productId] ?? 1;
  }

  setQuantity(productId: number, value: number) {
    this.quantities[productId] = Math.max(1, value);
  }

  addToCart(product: Product) {
    const qty = this.getQuantity(product.id);
    this.store.addToCart(product, qty);
    this.addedItems[product.id] = true;
    setTimeout(() => { this.addedItems[product.id] = false; }, 1500);
  }
}
