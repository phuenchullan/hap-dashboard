import { Component, computed, input, signal } from '@angular/core';
import { AsideItem } from './aside-item/aside-item';
import { type LucideIcon, LucideLayoutDashboard, LucideMap, LucideUser } from '@lucide/angular';

interface TagIcon {
  selected: boolean;
  icon: LucideIcon;
  tag: string;
  link: string;
}

@Component({
  imports: [AsideItem],
  selector: 'admin-aside',
  styleUrl: './admin-aside.css',
  templateUrl: './admin-aside.html',
})
export class AdminAside {
  itemSelected = signal<boolean>(true);
  tagIcons = signal<TagIcon[]>([
    { selected: true, icon: LucideLayoutDashboard, tag: 'Dashboard', link: '/dashboard' },
    { selected: false, icon: LucideUser, tag: 'Users', link: '/users' },
    { selected: false, icon: LucideMap, tag: 'Lands', link: '/lands' },
    { selected: false, icon: LucideMap, tag: 'Blocks', link: '/blocks' },
    { selected: false, icon: LucideMap, tag: 'Plantations', link: '/plantations' },
    { selected: false, icon: LucideMap, tag: 'Trays', link: '/trays' },
    { selected: false, icon: LucideUser, tag: 'Harvesters', link: '/harvesters' },
    { selected: false, icon: LucideLayoutDashboard, tag: 'Harvest', link: '/harvest' },
  ]);

  isOpenSidebar = input.required<boolean>();

  style = computed(() => {
    if (this.isOpenSidebar()) {
      return `hidden lg:flex flex-col border-r border-[var(--hap-divider)] bg-[var(--hap-sidebar-bg)] text-[var(--hap-sidebar-text)] transition-all duration-300 w-64`;
    } else {
      return `fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--hap-divider)] bg-[var(--hap-sidebar-bg)] text-[var(--hap-sidebar-text)] transition-all duration-300 lg:static -translate-x-full lg:translate-x-0 lg:w-20`;
    }
  });

  styleSidebar = computed(() => {
    if (!this.isOpenSidebar()) {
      return `flex items-center justify-center`;
    }
    return null;
  });

  onChangeSelected(event: { selected: boolean; index: number }) {
    this.tagIcons.update((tagIcons) => {
      const newTagIcons = tagIcons.map((tagIcon, index) => {
        if (index === event.index) {
          return { ...tagIcon, selected: event.selected };
        } else {
          return { ...tagIcon, selected: false };
        }
      });
      return newTagIcons;
    });
  }
}
