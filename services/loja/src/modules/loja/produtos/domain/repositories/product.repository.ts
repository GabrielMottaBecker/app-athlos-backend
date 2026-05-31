import { Product } from '../models/product.model';

export abstract class ProductRepository {
  abstract findAll(category?: string): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract create(product: Product): Promise<void>;
  abstract update(product: Product): Promise<void>;
  abstract delete(id: string): Promise<void>;
}