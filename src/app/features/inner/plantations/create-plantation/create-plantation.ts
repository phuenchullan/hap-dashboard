import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Block,
  CreatePlantation as CreatePlantationPayload,
  Plantation,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-create-plantation',
  imports: [FormsModule],
  templateUrl: './create-plantation.html',
})
export class CreatePlantation {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly blocks = signal<Block[]>([]);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form: CreatePlantationPayload = {
    fruit: '',
    variety: '',
    surface: 0,
    unit: 'ha',
    blockId: '',
  };

  readonly blocksResource = resource({
    loader: async () => {
      try {
        const response = await this.api.list<Block>('blocks');
        this.blocks.set(response.data);
        this.errorMessage.set(null);
        return response;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  close() {
    this.router.navigate(['/plantations']);
  }

  async create() {
    const payload: CreatePlantationPayload = {
      ...this.form,
      fruit: this.form.fruit.trim(),
      variety: this.form.variety.trim(),
      surface: Number(this.form.surface),
    };

    if (
      !payload.fruit ||
      !payload.variety ||
      payload.surface <= 0 ||
      !payload.unit ||
      !payload.blockId
    ) {
      this.errorMessage.set('Completa todos los campos de la plantación.');
      return;
    }

    this.isSaving.set(true);
    try {
      await this.api.create<Plantation, CreatePlantationPayload>('plantations', payload);
      await this.router.navigate(['/plantations']);
    } catch (error) {
      this.errorMessage.set(this.messageFrom(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private messageFrom(error: unknown) {
    return error instanceof Error ? error.message : 'Ocurrió un error.';
  }
}
