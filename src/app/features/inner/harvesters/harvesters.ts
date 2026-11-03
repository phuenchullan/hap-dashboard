import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideEye, LucidePlus, LucideSquarePen } from '@lucide/angular';
import {
  CustomTable,
  TableColumn,
  TableRowDirective,
} from '../../../core/components/custom-table/custom-table';
import { Modal } from '../../../core/components/modal/modal';
import { Harvester } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-harvesters',
  imports: [LucideEye, LucidePlus, LucideSquarePen, CustomTable, TableRowDirective, Modal],
  templateUrl: './harvesters.html',
})
export class Harvesters {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly pageSize = signal(10);
  readonly harvesters = signal<Harvester[]>([]);
  readonly selectedHarvester = signal<Harvester | null>(null);
  readonly isViewOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly headers = signal<TableColumn[]>([
    { key: 'rut', label: 'RUT' },
    { key: 'name', label: 'Nombre' },
    { key: 'lastname', label: 'Apellido' },
    { key: 'contrator', label: 'Contratista' },
    { key: 'isLoaded', label: 'Sincronizado' },
    { key: 'actions', label: 'Acciones', searchable: false },
  ]);

  readonly detailData = computed(() => {
    const harvester = this.selectedHarvester();
    if (!harvester) return [];

    return [
      { key: 'RUT', value: `${harvester.rut}-${harvester.dv}` },
      { key: 'Nombres', value: harvester.name },
      { key: 'Apellidos', value: harvester.lastname },
      { key: 'Contratista', value: harvester.contrator || '—' },
      { key: 'ID local', value: String(harvester.localStorePhoneId) },
      { key: 'Dispositivo', value: harvester.phoneId },
      { key: 'Fotografía', value: harvester.photo || '—' },
      { key: 'Sincronizado', value: harvester.isLoaded ? 'Sí' : 'Pendiente' },
      { key: 'Creado', value: new Date(harvester.createdAt).toLocaleDateString('es-CL') },
      { key: 'Actualizado', value: new Date(harvester.updatedAt).toLocaleDateString('es-CL') },
    ];
  });

  readonly harvestersResource = resource({
    loader: async () => {
      try {
        const response = await this.api.list<Harvester>('harvesters');
        this.harvesters.set(response.data);
        this.errorMessage.set(null);
        return response;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  createHarvester() {
    this.router.navigate(['/harvesters/create']);
  }

  viewHarvester(harvester: Harvester) {
    this.selectedHarvester.set(harvester);
    this.isViewOpen.set(true);
  }

  editHarvester(harvester: Harvester) {
    this.router.navigate(['/harvesters', harvester.id]);
  }

  closeView(close: boolean) {
    if (close) this.isViewOpen.set(false);
  }

  private messageFrom(error: unknown) {
    return error instanceof Error ? error.message : 'Ocurrió un error.';
  }
}
