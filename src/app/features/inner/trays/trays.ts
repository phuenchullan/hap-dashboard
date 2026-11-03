import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideEye, LucidePlus, LucideSquarePen } from '@lucide/angular';
import {
  CustomTable,
  TableColumn,
  TableRowDirective,
} from '../../../core/components/custom-table/custom-table';
import { Modal } from '../../../core/components/modal/modal';
import { Tray } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-trays',
  imports: [LucideEye, LucidePlus, LucideSquarePen, CustomTable, TableRowDirective, Modal],
  templateUrl: './trays.html',
})
export class Trays {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly pageSize = signal(10);
  readonly trays = signal<Tray[]>([]);
  readonly selectedTray = signal<Tray | null>(null);
  readonly isViewOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly headers = signal<TableColumn[]>([
    { key: 'tag', label: 'Etiqueta' },
    { key: 'description', label: 'Descripción' },
    { key: 'weight', label: 'Peso' },
    { key: 'weightPerTray', label: 'Peso por bandeja' },
    { key: 'actions', label: 'Acciones', searchable: false },
  ]);

  readonly detailData = computed(() => {
    const tray = this.selectedTray();
    if (!tray) return [];

    return [
      { key: 'Etiqueta', value: tray.tag },
      { key: 'Descripción', value: tray.description },
      { key: 'Peso', value: String(tray.weight) },
      { key: 'Peso por bandeja', value: String(tray.weightPerTray) },
    ];
  });

  readonly traysResource = resource({
    loader: async () => {
      try {
        const response = await this.api.list<Tray>('trays');
        this.trays.set(response.data);
        this.errorMessage.set(null);
        return response;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  createTray() {
    this.router.navigate(['/trays/create']);
  }

  viewTray(tray: Tray) {
    this.selectedTray.set(tray);
    this.isViewOpen.set(true);
  }

  editTray(tray: Tray) {
    this.router.navigate(['/trays', tray.id]);
  }

  closeView(close: boolean) {
    if (close) this.isViewOpen.set(false);
  }

  private messageFrom(error: unknown) {
    return error instanceof Error ? error.message : 'Ocurrió un error.';
  }
}
