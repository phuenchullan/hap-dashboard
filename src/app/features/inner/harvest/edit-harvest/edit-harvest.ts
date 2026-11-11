import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Harvester,
  Plantation,
  Take,
  Tray,
  UpdateTake,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

interface TakeForm {
  trayId: string;
  plantationId: string;
  harvesterId: string;
  numberOfTray: number;
  brute: number;
  neto: number;
  price: number;
}

@Component({
  selector: 'app-edit-harvest',
  imports: [FormsModule],
  templateUrl: './edit-harvest.html',
})
export class EditHarvest {
  private readonly api = inject(HarvestApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly takeId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly harvesters = signal<Harvester[]>([]);
  readonly trays = signal<Tray[]>([]);
  readonly plantations = signal<Plantation[]>([]);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly listParams = { page: 1, limit: 10 };
  readonly form = signal<TakeForm>({
    trayId: '',
    plantationId: '',
    harvesterId: '',
    numberOfTray: 0,
    brute: 0,
    neto: 0,
    price: 0,
  });

  readonly takeResource = resource({
    loader: async () => {
      if (!this.takeId) {
        this.errorMessage.set('No se encontró la cosecha solicitada.');
        return null;
      }

      try {
        const [take, harvesters, trays, plantations] = await Promise.all([
          this.api.get<Take | null>('takes', this.takeId),
          this.api.list<Harvester>('harvesters', this.listParams),
          this.api.list<Tray>('trays', this.listParams),
          this.api.list<Plantation>('plantations', this.listParams),
        ]);
        this.harvesters.set(harvesters.data);
        this.trays.set(trays.data);
        this.plantations.set(plantations.data);
        if (!take) {
          this.errorMessage.set('No se encontró la cosecha solicitada.');
          return null;
        }
        this.form.set({
          trayId: take.trayId,
          plantationId: take.plantationId ?? '',
          harvesterId: take.harvesterId,
          numberOfTray: take.numberOfTray,
          brute: take.brute,
          neto: take.neto,
          price: take.price,
        });
        this.errorMessage.set(null);
        return take;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  updateField<K extends keyof TakeForm>(field: K, value: TakeForm[K]) {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  close() {
    this.router.navigate(['/harvest']);
  }

  async update() {
    const form = this.form();
    const payload: UpdateTake = {
      trayId: form.trayId,
      plantationId: form.plantationId,
      harvesterId: form.harvesterId,
      numberOfTray: Number(form.numberOfTray),
      brute: Number(form.brute),
      neto: Number(form.neto),
      price: Number(form.price),
    };

    if (
      !payload.trayId ||
      !payload.plantationId ||
      !payload.harvesterId ||
      !payload.numberOfTray ||
      payload.numberOfTray <= 0 ||
      !payload.brute ||
      payload.brute <= 0 ||
      !payload.neto ||
      payload.neto <= 0 ||
      !payload.price ||
      payload.price <= 0
    ) {
      this.errorMessage.set('Completa todos los datos de la cosecha.');
      return;
    }

    this.isSaving.set(true);
    try {
      const take = await this.api.update<Take | null, UpdateTake>('takes', this.takeId, payload);
      if (!take) {
        this.errorMessage.set('No se encontró la cosecha solicitada.');
        return;
      }
      await this.router.navigate(['/harvest']);
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
