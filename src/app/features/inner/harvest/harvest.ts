import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideEye, LucideSquarePen } from '@lucide/angular';
import {
  CustomTable,
  TableColumn,
  TableRowDirective,
} from '../../../core/components/custom-table/custom-table';
import { Modal } from '../../../core/components/modal/modal';
import { Harvester, Plantation, Take, Tray } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-harvest',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    DatePipe,
    FormsModule,
    LucideEye,
    LucideSquarePen,
    CustomTable,
    TableRowDirective,
    Modal,
  ],
  templateUrl: './harvest.html',
})
export class Harvest {
  private readonly api = inject(HarvestApi);
  private readonly router = inject(Router);

  readonly pageSize = signal(10);
  readonly page = signal(1);
  readonly totalRecords = signal(0);
  readonly takes = signal<Take[]>([]);
  readonly harvesters = signal<Harvester[]>([]);
  readonly trays = signal<Tray[]>([]);
  readonly plantations = signal<Plantation[]>([]);
  readonly selectedTake = signal<Take | null>(null);
  readonly isViewOpen = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly today = this.todayDate();
  readonly startDate = signal(this.today);
  readonly endDate = signal(this.today);
  readonly appliedStartDate = signal(this.today);
  readonly appliedEndDate = signal(this.today);

  readonly totalTrays = computed(() =>
    this.takes().reduce((total, take) => total + take.numberOfTray, 0),
  );
  readonly totalNet = computed(() => this.takes().reduce((total, take) => total + take.neto, 0));
  readonly headers = signal<TableColumn[]>([
    { key: 'createdAt', label: 'Fecha' },
    { key: 'harvesterId', label: 'Cosechador' },
    { key: 'numberOfTray', label: 'Bandejas' },
    { key: 'brute', label: 'Bruto' },
    { key: 'neto', label: 'Neto' },
    { key: 'price', label: 'Precio' },
    { key: 'isLoaded', label: 'Sincronizado' },
    { key: 'actions', label: 'Acciones', searchable: false },
  ]);

  readonly detailData = computed(() => {
    const take = this.selectedTake();
    if (!take) return [];

    return [
      { key: 'Fecha', value: new Date(take.createdAt).toLocaleString('es-CL') },
      { key: 'Cosechador', value: this.harvesterName(take.harvesterId) },
      { key: 'Bandeja', value: this.trayName(take.trayId) },
      { key: 'Plantación', value: this.plantationName(take.plantationId) },
      { key: 'Bandejas', value: String(take.numberOfTray) },
      { key: 'Bruto', value: String(take.brute) },
      { key: 'Neto', value: String(take.neto) },
      { key: 'Precio', value: String(take.price) },
      { key: 'Sincronizado', value: take.isLoaded ? 'Sí' : 'Pendiente' },
    ];
  });

  readonly takesResource = resource({
    params: () => ({
      page: this.page(),
      limit: this.pageSize(),
      startDate: this.appliedStartDate(),
      endDate: this.appliedEndDate(),
    }),
    loader: async ({ params }) => {
      try {
        const catalogParams = { page: 1, limit: this.pageSize() };
        const [takes, harvesters, trays, plantations] = await Promise.all([
          this.api.list<Take>('takes', params),
          this.api.list<Harvester>('harvesters', catalogParams),
          this.api.list<Tray>('trays', catalogParams),
          this.api.list<Plantation>('plantations', catalogParams),
        ]);
        this.takes.set(takes.data);
        this.totalRecords.set(takes.meta.totalRecords);
        this.harvesters.set(harvesters.data);
        this.trays.set(trays.data);
        this.plantations.set(plantations.data);
        this.errorMessage.set(null);
        return takes;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  applyDateFilter() {
    if (this.startDate() && this.endDate() && this.startDate() > this.endDate()) {
      this.errorMessage.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.errorMessage.set(null);
    this.page.set(1);
    this.appliedStartDate.set(this.startDate());
    this.appliedEndDate.set(this.endDate());
  }

  changePage(page: number) {
    this.page.set(page);
  }

  harvesterName(id: string) {
    const harvester = this.harvesters().find((item) => item.id === id);
    return harvester ? `${harvester.name} ${harvester.lastname}` : id;
  }

  trayName(id: string) {
    return this.trays().find((tray) => tray.id === id)?.tag ?? id;
  }

  plantationName(id?: string | null) {
    if (!id) return '—';
    const plantation = this.plantations().find((item) => item.id === id);
    return plantation ? `${plantation.fruit} · ${plantation.variety}` : id;
  }

  viewTake(take: Take) {
    this.selectedTake.set(take);
    this.isViewOpen.set(true);
  }

  editTake(take: Take) {
    this.router.navigate(['/harvest', take.id]);
  }

  closeView(close: boolean) {
    if (close) this.isViewOpen.set(false);
  }

  private messageFrom(error: unknown) {
    return error instanceof Error ? error.message : 'Ocurrió un error.';
  }

  private todayDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
}
