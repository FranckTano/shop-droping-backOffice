import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FileSelectEvent } from 'primeng/fileupload';
import { ProductService } from '../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
  selectedFile?: File;
  saving = false;

  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null as number | null, Validators.required]
    });
  }

  onImageSelect(event: FileSelectEvent): void {
    const file = event.files?.[0];
    this.selectedFile = file ?? undefined;
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      return;
    }

    const formData = new FormData();
    const values = this.form.getRawValue();

    formData.append('name', values.name || '');
    formData.append('description', values.description || '');
    formData.append('price', String(values.price ?? 0));
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.saving = true;
    this.productService.create(formData).subscribe({
      next: () => {
        this.form.reset();
        this.selectedFile = undefined;
      },
      complete: () => {
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
