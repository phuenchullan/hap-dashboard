import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideEye, LucidePlus, LucideSquarePen } from '@lucide/angular';
import {
  CustomTable,
  TableColumn,
  TableRowDirective,
} from '../../../core/components/custom-table/custom-table';
import { Modal } from '../../../core/components/modal/modal';
import { Block, Plantation } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-plantations',
  imports: [LucideEye, LucidePlus, LucideSquarePen, CustomTable, TableRowDirective, Modal],
  templateUrl: './plantations.html',
})
export class Plantations {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly pageSize = signal(10);
  readonly plantations = signal<Plantation[]>([]);
  readonly blocks = signal<Block[]>([]);
  readonly selectedPlantation = signal<Plantation | null>(null);
  readonly isViewOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly headers = signal<TableColumn[]>([
    { key: 'fruit', label: 'Fruta' },
    { key: 'variety', label: 'Variedad' },
    { key: 'surface', label: 'Superficie' },
    { key: 'unit', label: 'Unidad' },
    { key: 'blockId', label: 'Cuartel' },
    { key: 'actions', label: 'Acciones', searchable: false },
  ]);

  readonly detailData = computed(() => {
    const plantation = this.selectedPlantation();
    if (!plantation) return [];

    return [
      { key: 'Fruta', value: plantation.fruit },
      { key: 'Variedad', value: plantation.variety },
      { key: 'Superficie', value: String(plantation.surface) },
      { key: 'Unidad', value: plantation.unit },
      { key: 'Cuartel', value: this.blockName(plantation.blockId) },
    ];
  });

  readonly plantationsResource = resource({
    loader: async () => {
      try {
        const [plantations, blocks] = await Promise.all([
          this.api.list<Plantation>('plantations'),
          this.api.list<Block>('blocks'),
        ]);
        this.plantations.set(plantations.data);
        this.blocks.set(blocks.data);
        this.errorMessage.set(null);
        return plantations;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  blockName(id: string) {
    return this.blocks().find((block) => block.id === id)?.name ?? id;
  }

  createPlantation() {
    this.router.navigate(['/plantations/create']);
  }

  viewPlantation(plantation: Plantation) {
    this.selectedPlantation.set(plantation);
    this.isViewOpen.set(true);
  }

  editPlantation(plantation: Plantation) {
    this.router.navigate(['/plantations', plantation.id]);
  }

  closeView(close: boolean) {
    if (close) this.isViewOpen.set(false);
  }

  private messageFrom(error: unknown) {
    return error instanceof Error ? error.message : 'Ocurrió un error.';
  }
}
