import { Component, input, output, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';

@Component({
  imports: [LucideX],
  selector: 'modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal {

  data = input.required<{ key: string, value: string }[]>();
  isOpen = input.required<boolean>();
  isClose = output<boolean>();

  closeModal() {
    this.isClose.emit(true);
  }
}
