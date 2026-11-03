import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateLand as LandForm,
  Land,
  UpdateLand,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-edit-land',
  imports: [FormsModule],
  templateUrl: './edit-land.html',
})
export class EditLand {
  private readonly api = inject(HarvestApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly landId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = signal<LandForm>({ name: '', surface: 0, unit: 'ha' });

  readonly landResource = resource({
    loader: async () => {
      if (!this.landId) {
        this.errorMessage.set('No se encontró el fundo solicitado.');
        return null;
      }
      try {
        const land = await this.api.get<Land | null>('lands', this.landId);
        if (!land) {
          this.errorMessage.set('No se encontró el fundo solicitado.');
          return null;
        }
        this.form.set({ name: land.name, surface: land.surface, unit: land.unit });
        this.errorMessage.set(null);
        return land;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  updateField<K extends keyof LandForm>(field: K, value: LandForm[K]) {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  close() {
    this.router.navigate(['/lands']);
  }

  async update() {
    const form = this.form();
    const payload: UpdateLand = {
      name: form.name.trim(),
      surface: Number(form.surface),
      unit: form.unit.trim(),
    };
    if (!payload.name || !payload.surface || payload.surface <= 0 || !payload.unit) {
      this.errorMessage.set('Completa todos los campos del fundo.');
      return;
    }

    this.isSaving.set(true);
    try {
      const land = await this.api.update<Land | null, UpdateLand>('lands', this.landId, payload);
      if (!land) {
        this.errorMessage.set('No se encontró el fundo solicitado.');
        return;
      }
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
