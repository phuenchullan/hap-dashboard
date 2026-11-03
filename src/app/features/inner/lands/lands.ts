import { Component, computed, inject, resource, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideEye, LucidePlus, LucideSquarePen } from '@lucide/angular';
import {
  CustomTable,
  TableColumn,
  TableRowDirective,
} from '../../../core/components/custom-table/custom-table';
import { Modal } from '../../../core/components/modal/modal';
import { Land } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-lands',
  imports: [
    DatePipe,
    LucideEye,
    LucidePlus,
    LucideSquarePen,
    CustomTable,
    TableRowDirective,
    Modal,
  ],
  templateUrl: './lands.html',
})
export class Lands {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly pageSize = signal(10);
  readonly lands = signal<Land[]>([]);
  readonly selectedLand = signal<Land | null>(null);
  readonly isViewOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly headers = signal<TableColumn[]>([
    { key: 'name', label: 'Nombre' },
    { key: 'surface', label: 'Superficie' },
    { key: 'unit', label: 'Unidad' },
    { key: 'createdAt', label: 'Creado' },
    { key: 'actions', label: 'Acciones', searchable: false },
  ]);

  readonly detailData = computed(() => {
    const land = this.selectedLand();
    if (!land) return [];

    return [
      { key: 'Nombre', value: land.name },
      { key: 'Superficie', value: String(land.surface) },
      { key: 'Unidad', value: land.unit },
      { key: 'Creado', value: new Date(land.createdAt).toLocaleDateString('es-CL') },
      { key: 'Actualizado', value: new Date(land.updatedAt).toLocaleDateString('es-CL') },
    ];
  });

  readonly landsResource = resource({
    loader: async () => {
      try {
        const response = await this.api.list<Land>('lands');
        this.lands.set(response.data);
        this.errorMessage.set(null);
        return response;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  createLand() {
    this.router.navigate(['/lands/create']);
  }

  viewLand(land: Land) {
    this.selectedLand.set(land);
    this.isViewOpen.set(true);
  }

  editLand(land: Land) {
    this.router.navigate(['/lands', land.id]);
  }

  closeView(close: boolean) {
    if (close) this.isViewOpen.set(false);
  }

  private messageFrom(error: unknown) {
    return error instanceof Error ? error.message : 'Ocurrió un error.';
  }
}
