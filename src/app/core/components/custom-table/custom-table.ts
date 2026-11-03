import { NgTemplateOutlet } from '@angular/common';
import { Component, Directive, TemplateRef, computed, contentChild, input, signal } from '@angular/core';
import { LucideSearch } from '@lucide/angular';

export interface TableColumn {
  key: string;
  label: string;
  searchable?: boolean;
}

type TableItem = object;

@Directive({
  selector: 'ng-template[appTableRow]',
})
export class TableRowDirective {
  constructor(readonly template: TemplateRef<{ $implicit: any; index: number }>) {}
}

@Component({
  imports: [NgTemplateOutlet, LucideSearch],
  selector: 'custom-table',
  styleUrl: './custom-table.css',
  templateUrl: './custom-table.html',
})
export class CustomTable {
  readonly headers = input.required<readonly (string | TableColumn)[]>();
  readonly data = input.required<readonly TableItem[]>();
  readonly pageSize = input(10);
  readonly searchPlaceholder = input('Search...');
  readonly emptyMessage = input('No records found.');
  readonly customRow = contentChild(TableRowDirective);

  readonly query = signal('');
  readonly page = signal(1);

  readonly columns = computed<TableColumn[]>(() => {
    const firstItem = this.data()[0];

    return this.headers().map((header) => {
      if (typeof header !== 'string') {
        return header;
      }

      return {
        key: this.resolveKey(header, firstItem),
        label: header,
      };
    });
  });

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();

    if (!query) {
      return this.data();
    }

    const searchableColumns = this.columns().filter((column) => column.searchable !== false);

    return this.data().filter((item) =>
      searchableColumns.some((column) =>
        this.displayValue(this.cellValue(item, column.key)).toLowerCase().includes(query),
      ),
    );
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount()));

  readonly visible = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  readonly rangeStart = computed(() =>
    this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filtered().length),
  );

  onQuery(value: string) {
    this.query.set(value);
    this.page.set(1);
  }

  previousPage() {
    this.page.update((page) => Math.max(1, page - 1));
  }

  nextPage() {
    this.page.update((page) => Math.min(this.pageCount(), page + 1));
  }

  cellValue(item: TableItem, key: string): unknown {
    return (item as Record<string, unknown>)[key];
  }

  displayValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  trackItem(index: number, item: TableItem): unknown {
    const record = item as Record<string, unknown>;
    return record['id'] ?? record['_id'] ?? index;
  }

  private resolveKey(label: string, item?: TableItem): string {
    if (!item) {
      return label;
    }

    const normalizedLabel = this.normalize(label);
    const matchingKey = Object.keys(item).find((key) => this.normalize(key) === normalizedLabel);
    return matchingKey ?? label;
  }

  private normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
