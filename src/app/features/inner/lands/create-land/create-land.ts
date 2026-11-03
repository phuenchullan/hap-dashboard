import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateLand as LandForm, Land } from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-create-land',
  imports: [FormsModule],
  templateUrl: './create-land.html',
})
export class CreateLand {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  form: LandForm = { name: '', surface: 0, unit: 'ha' };

  close() {
    this.router.navigate(['/lands']);
  }

  async create() {
    const payload: LandForm = {
      name: this.form.name.trim(),
      surface: Number(this.form.surface),
      unit: this.form.unit.trim(),
    };
    if (!payload.name || payload.surface <= 0 || !payload.unit) {
      this.errorMessage.set('Completa todos los campos del fundo.');
      return;
    }

    this.isSaving.set(true);
    try {
      await this.api.create<Land, LandForm>('lands', payload);
      await this.router.navigate(['/lands']);
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
