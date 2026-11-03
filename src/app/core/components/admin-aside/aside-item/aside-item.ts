import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

@Component({
  imports: [RouterLink, LucideDynamicIcon],
  selector: 'aside-item',
  styleUrl: './aside-item.css',
  templateUrl: './aside-item.html',
})
export class AsideItem {

  index = input.required<number>();
  tag = input.required<string>();
  itemSelected = input.required<boolean>();
  icon = input.required<LucideIcon>();
  link = input.required<string>();
  changeSelected = output<{ selected: boolean, index: number }>();

  isOpenSidebar = input.required<boolean>();

  style = computed(() => {
    const base =
      'flex items-center gap-3 rounded-[var(--radius-card-sm)] px-3 text-sm transition-all duration-200 hover:bg-[var(--hap-surface-hover)]';

    if (this.itemSelected()) {
      return `${base} bg-[var(--hap-sidebar-active-bg)] text-[var(--hap-sidebar-text-active)]`;
    }


    if(!this.isOpenSidebar()){
      return base;
    }

    return base;
  });

  onSelectedChange() {
    this.changeSelected.emit({ selected: !this.itemSelected(), index: this.index() });
  }


}
