import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideEye, LucidePlus, LucideSquarePen } from '@lucide/angular';
import {
  CustomTable,
  TableColumn,
  TableRowDirective,
} from '../../../core/components/custom-table/custom-table';
import { Modal } from '../../../core/components/modal/modal';
import { Block, Land } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-blocks',
  imports: [LucideEye, LucidePlus, LucideSquarePen, CustomTable, TableRowDirective, Modal],
  templateUrl: './blocks.html',
})
export class Blocks {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly pageSize = signal(10);
  readonly blocks = signal<Block[]>([]);
  readonly lands = signal<Land[]>([]);
  readonly selectedBlock = signal<Block | null>(null);
  readonly isViewOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly headers = signal<TableColumn[]>([
    { key: 'name', label: 'Nombre' },
    { key: 'surface', label: 'Superficie' },
    { key: 'unit', label: 'Unidad' },
    { key: 'landId', label: 'Fundo' },
    { key: 'actions', label: 'Acciones', searchable: false },
  ]);

  readonly detailData = computed(() => {
    const block = this.selectedBlock();
    if (!block) return [];

    return [
      { key: 'Nombre', value: block.name },
      { key: 'Superficie', value: String(block.surface) },
      { key: 'Unidad', value: block.unit },
      { key: 'Fundo', value: this.landName(block.landId) },
      { key: 'Creado', value: new Date(block.createdAt).toLocaleDateString('es-CL') },
      { key: 'Actualizado', value: new Date(block.updatedAt).toLocaleDateString('es-CL') },
    ];
  });

  readonly blocksResource = resource({
    loader: async () => {
      try {
        const [blocks, lands] = await Promise.all([
          this.api.list<Block>('blocks'),
          this.api.list<Land>('lands'),
        ]);
        this.blocks.set(blocks.data);
        this.lands.set(lands.data);
        this.errorMessage.set(null);
        return blocks;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  landName(id: string) {
    return this.lands().find((land) => land.id === id)?.name ?? id;
  }

  createBlock() {
    this.router.navigate(['/blocks/create']);
  }

  viewBlock(block: Block) {
    this.selectedBlock.set(block);
    this.isViewOpen.set(true);
  }

  editBlock(block: Block) {
    this.router.navigate(['/blocks', block.id]);
  }

  closeView(close: boolean) {
    if (close) this.isViewOpen.set(false);
  }

  private messageFrom(error: unknown) {
    return error instanceof Error ? error.message : 'Ocurrió un error.';
  }
}
