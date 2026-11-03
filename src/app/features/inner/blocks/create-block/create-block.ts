import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Block,
  CreateBlock as BlockForm,
  Land,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-create-block',
  imports: [FormsModule],
  templateUrl: './create-block.html',
})
export class CreateBlock {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly lands = signal<Land[]>([]);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  form: BlockForm = { name: '', surface: 0, unit: 'ha', landId: '' };

  readonly landsResource = resource({
    loader: async () => {
      try {
        const response = await this.api.list<Land>('lands');
        this.lands.set(response.data);
        return response;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  close() {
    this.router.navigate(['/blocks']);
  }

  async create() {
    const payload: BlockForm = {
      name: this.form.name.trim(),
      surface: Number(this.form.surface),
      unit: this.form.unit.trim(),
      landId: this.form.landId,
    };
    if (!payload.name || payload.surface <= 0 || !payload.unit || !payload.landId) {
      this.errorMessage.set('Completa todos los campos del cuartel.');
      return;
    }

    this.isSaving.set(true);
    try {
      await this.api.create<Block, BlockForm>('blocks', payload);
      await this.router.navigate(['/blocks']);
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
