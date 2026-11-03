import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePlus } from '@lucide/angular';
import {
  CustomTable,
  TableColumn,
  TableRowDirective,
} from '../../../core/components/custom-table/custom-table';
import { CreateTake, Harvester, Take, Tray } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-harvest',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, LucidePlus, CustomTable, TableRowDirective],
  templateUrl: './harvest.html',
})
export class Harvest {
  private readonly api = inject(HarvestApi);

  readonly pageSize = signal(10);
  readonly takes = signal<Take[]>([]);
  readonly harvesters = signal<Harvester[]>([]);
  readonly trays = signal<Tray[]>([]);
  readonly isOpen = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly totalTrays = computed(() =>
    this.takes().reduce((total, take) => total + take.numberOfTray, 0),
  );
  readonly totalNet = computed(() => this.takes().reduce((total, take) => total + take.neto, 0));
  readonly headers = signal<TableColumn[]>([
    { key: 'harvesterId', label: 'Cosechador' },
    { key: 'numberOfTray', label: 'Bandejas' },
    { key: 'brute', label: 'Bruto' },
    { key: 'neto', label: 'Neto' },
    { key: 'price', label: 'Precio' },
    { key: 'isLoaded', label: 'Sincronizado' },
    { key: 'actions', label: 'Acciones' }
  ]);

  form = {
    trayId: '',
    harvesterId: '',
    numberOfTray: 0,
    brute: 0,
    neto: 0,
    price: 0,
  };

  readonly takesResource = resource({
    loader: async () => {
      try {
        const [takes, harvesters, trays] = await Promise.all([
          this.api.list<Take>('takes'),
          this.api.list<Harvester>('harvesters'),
          this.api.list<Tray>('trays'),
        ]);
        this.takes.set(takes.data);
        this.harvesters.set(harvesters.data);
        this.trays.set(trays.data);
        this.errorMessage.set(null);
        return takes;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  harvesterName(id: string) {
    const harvester = this.harvesters().find((item) => item.id === id);
    return harvester ? `${harvester.name} ${harvester.lastname}` : id;
  }

  async create() {
    if (
      !this.form.trayId ||
      !this.form.harvesterId ||
      this.form.numberOfTray <= 0 ||
      this.form.brute <= 0 ||
      this.form.neto <= 0 ||
      this.form.price <= 0
    ) {
      this.errorMessage.set('Completa todos los datos de la cosecha.');
      return;
    }

    const payload: CreateTake = {
      ...this.form,
      phoneId: `dashboard-${Date.now()}`,
      isLoaded: false,
    };
    this.isSaving.set(true);
    try {
      await this.api.create<Take, CreateTake>('takes', payload);
      this.form = {
        trayId: '',
        harvesterId: '',
        numberOfTray: 0,
        brute: 0,
        neto: 0,
        price: 0,
      };
      this.isOpen.set(false);
      this.errorMessage.set(null);
      this.takesResource.reload();
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
