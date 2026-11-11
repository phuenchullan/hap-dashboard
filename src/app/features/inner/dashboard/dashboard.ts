import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideBanknote,
  LucideBoxes,
  LucideCalendarRange,
  LucideChartColumn,
  LucideChartPie,
  LucideScale,
  LucideTrendingDown,
  LucideTrophy,
  LucideWheat,
} from '@lucide/angular';
import { Harvester, Plantation, Take, Tray } from '../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../core/services/harvest-api/harvest-api';

interface RankedItem {
  id: string;
  label: string;
  trays: number;
  neto: number;
  percent: number;
}

interface ShareItem {
  id: string;
  label: string;
  value: number;
  percent: number;
  color: string;
}

interface DayPoint {
  date: string;
  label: string;
  trays: number;
  percent: number;
}

const SHARE_COLORS = ['#39a188', '#1a66d8', '#d4a017', '#c46b72', '#7c6cf0', '#4aa3df', '#8f9aa8'];

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    FormsModule,
    LucideBanknote,
    LucideBoxes,
    LucideCalendarRange,
    LucideChartColumn,
    LucideChartPie,
    LucideScale,
    LucideTrendingDown,
    LucideTrophy,
    LucideWheat,
  ],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(HarvestApi);

  private readonly today = this.todayDate();
  readonly startDate = signal(this.today);
  readonly endDate = signal(this.today);
  readonly appliedStartDate = signal(this.today);
  readonly appliedEndDate = signal(this.today);
  readonly errorMessage = signal<string | null>(null);
  readonly takes = signal<Take[]>([]);
  readonly harvesters = signal<Harvester[]>([]);
  readonly trays = signal<Tray[]>([]);
  readonly plantations = signal<Plantation[]>([]);

  readonly totalTakes = computed(() => this.takes().length);
  readonly totalTrays = computed(() =>
    this.takes().reduce((total, take) => total + take.numberOfTray, 0),
  );
  readonly totalNet = computed(() => this.takes().reduce((total, take) => total + take.neto, 0));
  readonly totalBrute = computed(() => this.takes().reduce((total, take) => total + take.brute, 0));
  readonly totalValue = computed(() => this.takes().reduce((total, take) => total + take.price, 0));
  readonly syncedPercent = computed(() => {
    const takes = this.takes();
    if (takes.length === 0) return 0;
    return (takes.filter((take) => take.isLoaded).length / takes.length) * 100;
  });

  readonly rankedHarvesters = computed(() => {
    const grouped = new Map<string, RankedItem>();
    for (const take of this.takes()) {
      const current = grouped.get(take.harvesterId) ?? {
        id: take.harvesterId,
        label: this.harvesterName(take.harvesterId),
        trays: 0,
        neto: 0,
        percent: 0,
      };
      current.trays += take.numberOfTray;
      current.neto += take.neto;
      grouped.set(take.harvesterId, current);
    }

    const items = [...grouped.values()].sort((a, b) => b.neto - a.neto);
    const max = items[0]?.neto || 1;
    return items.map((item) => ({ ...item, percent: (item.neto / max) * 100 }));
  });
  readonly rankedCount = computed(() => this.rankedHarvesters().length);
  readonly topHarvesters = computed(() => this.rankedHarvesters().slice(0, 5));
  readonly worstHarvesters = computed(() => this.rankedHarvesters().slice().reverse().slice(0, 5));
  readonly trayShares = computed(() => this.sharesBy((take) => this.trayLabel(take.trayId)));
  readonly cropShares = computed(() => this.sharesBy((take) => this.cropLabel(take.plantationId)));
  readonly dailySeries = computed(() => this.buildDailySeries());
  readonly trayGradient = computed(() => this.conicGradient(this.trayShares()));
  readonly cropGradient = computed(() => this.conicGradient(this.cropShares()));

  readonly dashboardResource = resource({
    params: () => ({
      startDate: this.appliedStartDate(),
      endDate: this.appliedEndDate(),
    }),
    loader: async ({ params }) => {
      try {
        const [takes, harvesters, trays, plantations] = await Promise.all([
          this.api.listAll<Take>('takes', params),
          this.api.listAll<Harvester>('harvesters'),
          this.api.listAll<Tray>('trays'),
          this.api.listAll<Plantation>('plantations'),
        ]);
        this.takes.set(takes);
        this.harvesters.set(harvesters);
        this.trays.set(trays);
        this.plantations.set(plantations);
        this.errorMessage.set(null);
        return takes;
      } catch (error) {
        this.errorMessage.set(error instanceof Error ? error.message : 'Ocurrió un error.');
        return [];
      }
    },
  });

  applyDateFilter() {
    if (this.startDate() && this.endDate() && this.startDate() > this.endDate()) {
      this.errorMessage.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    this.errorMessage.set(null);
    this.appliedStartDate.set(this.startDate());
    this.appliedEndDate.set(this.endDate());
  }

  private sharesBy(labelFor: (take: Take) => string): ShareItem[] {
    const grouped = new Map<string, number>();
    for (const take of this.takes()) {
      const label = labelFor(take);
      grouped.set(label, (grouped.get(label) ?? 0) + take.numberOfTray);
    }
    const total = [...grouped.values()].reduce((sum, value) => sum + value, 0);
    return [...grouped.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], index) => ({
        id: label,
        label,
        value,
        percent: total === 0 ? 0 : (value / total) * 100,
        color: SHARE_COLORS[index % SHARE_COLORS.length],
      }));
  }

  private buildDailySeries(): DayPoint[] {
    const start = this.appliedStartDate();
    const end = this.appliedEndDate();
    if (!start || !end) return [];

    const byDay = new Map<string, number>();
    for (const take of this.takes()) {
      const day = take.createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + take.numberOfTray);
    }

    const points: DayPoint[] = [];
    const cursor = new Date(`${start}T00:00:00`);
    const last = new Date(`${end}T00:00:00`);
    while (cursor <= last) {
      const date = this.formatDate(cursor);
      points.push({
        date,
        label: `${String(cursor.getDate()).padStart(2, '0')}/${String(cursor.getMonth() + 1).padStart(2, '0')}`,
        trays: byDay.get(date) ?? 0,
        percent: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const max = Math.max(...points.map((point) => point.trays), 1);
    return points.map((point) => ({ ...point, percent: (point.trays / max) * 100 }));
  }

  private conicGradient(items: ShareItem[]) {
    if (items.length === 0) return 'conic-gradient(var(--hap-divider) 0 100%)';
    let offset = 0;
    const stops = items.map((item) => {
      const next = offset + item.percent;
      const stop = `${item.color} ${offset}% ${next}%`;
      offset = next;
      return stop;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  private harvesterName(id: string) {
    const harvester = this.harvesters().find((item) => item.id === id);
    return harvester ? `${harvester.name} ${harvester.lastname}` : id;
  }

  private trayLabel(id: string) {
    const tray = this.trays().find((item) => item.id === id);
    return tray ? tray.tag : 'Sin bandeja';
  }

  private cropLabel(id?: string | null) {
    if (!id) return 'Sin cultivo';
    const plantation = this.plantations().find((item) => item.id === id);
    return plantation ? plantation.fruit : 'Sin cultivo';
  }

  private todayDate() {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
