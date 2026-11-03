import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Block,
  CreateBlock as BlockForm,
  Land,
  UpdateBlock,
} from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-edit-block',
  imports: [FormsModule],
  templateUrl: './edit-block.html',
})
export class EditBlock {
  private readonly api = inject(HarvestApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blockId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly lands = signal<Land[]>([]);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = signal<BlockForm>({ name: '', surface: 0, unit: 'ha', landId: '' });

  readonly blockResource = resource({
    loader: async () => {
      if (!this.blockId) {
        this.errorMessage.set('No se encontró el cuartel solicitado.');
        return null;
      }
      try {
        const [block, lands] = await Promise.all([
          this.api.get<Block | null>('blocks', this.blockId),
          this.api.list<Land>('lands'),
        ]);
        this.lands.set(lands.data);
        if (!block) {
          this.errorMessage.set('No se encontró el cuartel solicitado.');
          return null;
        }
        this.form.set({
          name: block.name,
          surface: block.surface,
          unit: block.unit,
          landId: block.landId,
        });
        this.errorMessage.set(null);
        return block;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  updateField<K extends keyof BlockForm>(field: K, value: BlockForm[K]) {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  close() {
    this.router.navigate(['/blocks']);
  }

  async update() {
    const form = this.form();
    const payload: UpdateBlock = {
      name: form.name.trim(),
      surface: Number(form.surface),
      unit: form.unit.trim(),
      landId: form.landId,
    };
    if (
      !payload.name ||
      !payload.surface ||
      payload.surface <= 0 ||
      !payload.unit ||
      !payload.landId
    ) {
      this.errorMessage.set('Completa todos los campos del cuartel.');
      return;
    }

    this.isSaving.set(true);
    try {
      const block = await this.api.update<Block | null, UpdateBlock>(
        'blocks',
        this.blockId,
        payload,
      );
      if (!block) {
        this.errorMessage.set('No se encontró el cuartel solicitado.');
        return;
      }
      await this.router.navigate(['/blocks']);
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
