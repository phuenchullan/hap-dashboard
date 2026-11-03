import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateTray as TrayForm,
  Tray,
  UpdateTray,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-edit-tray',
  imports: [FormsModule],
  templateUrl: './edit-tray.html',
})
export class EditTray {
  private readonly api = inject(HarvestApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly trayId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = signal<TrayForm>({
    tag: '',
    description: '',
    weight: 0,
    weightPerTray: 0,
  });

  readonly trayResource = resource({
    loader: async () => {
      if (!this.trayId) {
        this.errorMessage.set('No se encontró la bandeja solicitada.');
        return null;
      }

      try {
        const tray = await this.api.get<Tray | null>('trays', this.trayId);
        if (!tray) {
          this.errorMessage.set('No se encontró la bandeja solicitada.');
          return null;
        }

        this.form.set({
          tag: tray.tag,
          description: tray.description,
          weight: tray.weight,
          weightPerTray: tray.weightPerTray,
        });
        this.errorMessage.set(null);
        return tray;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  close() {
    this.router.navigate(['/trays']);
  }

  updateField<K extends keyof TrayForm>(field: K, value: TrayForm[K]) {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  async update() {
    const form = this.form();
    const payload: UpdateTray = {
      tag: form.tag.trim(),
      description: form.description.trim(),
      weight: Number(form.weight),
      weightPerTray: Number(form.weightPerTray),
    };

    if (
      !payload.tag ||
      !payload.description ||
      !payload.weight ||
      payload.weight <= 0 ||
      !payload.weightPerTray ||
      payload.weightPerTray <= 0
    ) {
      this.errorMessage.set('Completa todos los campos de la bandeja.');
      return;
    }

    this.isSaving.set(true);
    try {
      const tray = await this.api.update<Tray | null, UpdateTray>('trays', this.trayId, payload);
      if (!tray) {
        this.errorMessage.set('No se encontró la bandeja solicitada.');
        return;
      }
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
