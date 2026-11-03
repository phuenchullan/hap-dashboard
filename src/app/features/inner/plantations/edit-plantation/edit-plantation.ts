import { Component, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Block, Plantation, UpdatePlantation } from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  selector: 'app-edit-plantation',
  imports: [FormsModule],
  templateUrl: './edit-plantation.html',
})
export class EditPlantation {
  private readonly api = inject(HarvestApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly plantationId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly blocks = signal<Block[]>([]);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form: UpdatePlantation = {
    fruit: '',
    variety: '',
    surface: 0,
    unit: 'ha',
    blockId: '',
  };

  readonly plantationResource = resource({
    loader: async () => {
      if (!this.plantationId) {
        this.errorMessage.set('No se encontró la plantación solicitada.');
        return null;
      }

      try {
        const [plantation, blocks] = await Promise.all([
          this.api.get<Plantation>('plantations', this.plantationId),
          this.api.list<Block>('blocks'),
        ]);
        this.blocks.set(blocks.data);
        this.form = {
          fruit: plantation.fruit,
          variety: plantation.variety,
          surface: plantation.surface,
          unit: plantation.unit,
          blockId: plantation.blockId,
        };
        this.errorMessage.set(null);
        return plantation;
      } catch (error) {
        this.errorMessage.set(this.messageFrom(error));
        return null;
      }
    },
  });

  close() {
    this.router.navigate(['/plantations']);
  }

  async update() {
    const payload: UpdatePlantation = {
      fruit: this.form.fruit?.trim(),
      variety: this.form.variety?.trim(),
      surface: Number(this.form.surface),
      unit: this.form.unit,
      blockId: this.form.blockId,
    };

    if (
      !payload.fruit ||
      !payload.variety ||
      !payload.surface ||
      payload.surface <= 0 ||
      !payload.unit ||
      !payload.blockId
    ) {
      this.errorMessage.set('Completa todos los campos de la plantación.');
      return;
    }

    this.isSaving.set(true);
    try {
      await this.api.update<Plantation, UpdatePlantation>(
        'plantations',
        this.plantationId,
        payload,
      );
      await this.router.navigate(['/plantations']);
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
