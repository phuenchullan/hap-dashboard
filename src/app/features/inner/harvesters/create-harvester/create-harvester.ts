import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CreateHarvester as HarvesterPayload,
  Harvester,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

interface HarvesterForm {
  rut: number;
  dv: string;
  name: string;
  lastname: string;
  contrator: string;
  photo: string;
}

@Component({
  selector: 'app-create-harvester',
  imports: [FormsModule],
  templateUrl: './create-harvester.html',
})
export class CreateHarvester {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  form: HarvesterForm = {
    rut: 0,
    dv: '',
    name: '',
    lastname: '',
    contrator: '',
    photo: '',
  };

  close() {
    this.router.navigate(['/harvesters']);
  }

  async create() {
    if (
      Number(this.form.rut) <= 0 ||
      !this.form.dv.trim() ||
      !this.form.name.trim() ||
      !this.form.lastname.trim()
    ) {
      this.errorMessage.set('Completa los datos obligatorios del cosechador.');
      return;
    }

    const timestamp = Date.now();
    const payload: HarvesterPayload = {
      rut: Number(this.form.rut),
      dv: this.form.dv.trim().toUpperCase(),
      name: this.form.name.trim(),
      lastname: this.form.lastname.trim(),
      contrator: this.form.contrator.trim() || undefined,
      photo: this.form.photo.trim() || undefined,
      localStorePhoneId: (timestamp % 2147483646) + 1,
      phoneId: `dashboard-${timestamp}`,
      isLoaded: false,
    };

    this.isSaving.set(true);
    try {
      await this.api.create<Harvester, HarvesterPayload>('harvesters', payload);
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
