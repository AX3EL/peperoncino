import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { Product } from '../../models/product.model';
import { CATEGORIES } from '../../data/products';

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
  searchTerm = signal<string>('');
  quantities: Record<number, number> = {};
  addedItems: Record<number, boolean> = {};

  readonly categories: string[] = ['Tutti', ...CATEGORIES];

  get filteredProducts() {
    const cat = this.selectedCategory();
    const term = this.searchTerm().toLowerCase();
    let products = this.store.products();
    if (cat !== 'Tutti') {
      products = products.filter(p => p.category === cat);
    }
    if (term) {
      products = products.filter(p => p.name.toLowerCase().includes(term));
    }
    return products;
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
