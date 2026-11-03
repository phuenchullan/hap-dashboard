import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateHarvester as HarvesterForm,
  Harvester,
  UpdateHarvester,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-edit-harvester',
  imports: [FormsModule],
  templateUrl: './edit-harvester.html',
})
export class EditHarvester {
  private readonly api = inject(HarvestApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly harvesterId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = signal<HarvesterForm>({
    rut: 0,
    dv: '',
    name: '',
    lastname: '',
    contrator: '',
    localStorePhoneId: 0,
    phoneId: '',
    photo: '',
    isLoaded: false,
  });

  readonly harvesterResource = resource({
    loader: async () => {
      if (!this.harvesterId) {
        this.errorMessage.set('No se encontró el cosechador solicitado.');
        return null;
      }
      try {
        const harvester = await this.api.get<Harvester | null>('harvesters', this.harvesterId);
        if (!harvester) {
          this.errorMessage.set('No se encontró el cosechador solicitado.');
          return null;
        }
        this.form.set({
          rut: harvester.rut,
          dv: harvester.dv,
          name: harvester.name,
          lastname: harvester.lastname,
          contrator: harvester.contrator,
          localStorePhoneId: harvester.localStorePhoneId,
          phoneId: harvester.phoneId,
          photo: harvester.photo,
          isLoaded: harvester.isLoaded,
        });
        this.errorMessage.set(null);
        return harvester;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  updateField<K extends keyof HarvesterForm>(field: K, value: HarvesterForm[K]) {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  close() {
    this.router.navigate(['/harvesters']);
  }

  async update() {
    const form = this.form();
    const payload: UpdateHarvester = {
      rut: Number(form.rut),
      dv: form.dv.trim().toUpperCase(),
      name: form.name.trim(),
      lastname: form.lastname.trim(),
      contrator: form.contrator?.trim() || undefined,
      localStorePhoneId: Number(form.localStorePhoneId),
      phoneId: form.phoneId.trim(),
      photo: form.photo?.trim() || undefined,
      isLoaded: form.isLoaded,
    };
    if (
      !payload.rut ||
      payload.rut <= 0 ||
      !payload.dv ||
      !payload.name ||
      !payload.lastname ||
      !payload.localStorePhoneId ||
      payload.localStorePhoneId <= 0 ||
      !payload.phoneId
    ) {
      this.errorMessage.set('Completa los datos obligatorios del cosechador.');
      return;
    }

    this.isSaving.set(true);
    try {
      const harvester = await this.api.update<Harvester | null, UpdateHarvester>(
        'harvesters',
        this.harvesterId,
        payload,
      );
      if (!harvester) {
        this.errorMessage.set('No se encontró el cosechador solicitado.');
        return;
      }
      await this.router.navigate(['/harvesters']);
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
