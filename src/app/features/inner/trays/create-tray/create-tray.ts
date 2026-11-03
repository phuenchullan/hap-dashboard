import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CreateTray as CreateTrayPayload,
  Tray,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-create-tray',
  imports: [FormsModule],
  templateUrl: './create-tray.html',
})
export class CreateTray {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form: CreateTrayPayload = {
    tag: '',
    description: '',
    weight: 0,
    weightPerTray: 0,
  };

  close() {
    this.router.navigate(['/trays']);
  }

  async create() {
    const payload: CreateTrayPayload = {
      tag: this.form.tag.trim(),
      description: this.form.description.trim(),
      weight: Number(this.form.weight),
      weightPerTray: Number(this.form.weightPerTray),
    };

    if (!payload.tag || !payload.description || payload.weight <= 0 || payload.weightPerTray <= 0) {
      this.errorMessage.set('Completa todos los campos de la bandeja.');
      return;
    }

    this.isSaving.set(true);
    try {
      await this.api.create<Tray, CreateTrayPayload>('trays', payload);
      await this.router.navigate(['/trays']);
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
