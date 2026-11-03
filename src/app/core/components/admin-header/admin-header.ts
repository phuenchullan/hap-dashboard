import { Component, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Storage } from '../../services/storage/storage';
import { LucideChevronDown, LucideMenu, LucideMoon, LucidePanelLeftClose, LucidePanelLeftOpen, LucideSun } from '@lucide/angular';
import { NgOptimizedImage } from '@angular/common';
import { UserRow } from '../../interfaces/users.interface';

@Component({
  imports: [LucidePanelLeftClose, LucidePanelLeftOpen, LucideMenu, LucideMoon, LucideSun, LucideChevronDown, NgOptimizedImage],
  selector: 'admin-header',
  styleUrl: './admin-header.css',
  templateUrl: './admin-header.html',
})
export class AdminHeader {

  user = input.required<UserRow>();
  private readonly router = inject(Router);
  private readonly storage = inject(Storage);
  isOpenSidebar = signal(true);
  toggleSidebar = output<boolean>();
  isDarkMode = signal(true);
  darkModeOutput = output<boolean>();
  imageProfile = signal<string>('/assets/male-avatar.jpg');
  isDropdownOpen = signal(false);
  role = signal<string>('admin');


  styleButtonDropdown = computed(() => {
    return `inline-flex items-center justify-center bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none`;
  });


  readonly section = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.sectionLabel()),
    ),
    { initialValue: this.sectionLabel() },
  );

  private sectionLabel() {
    const segment = this.router.url.split('?')[0].split('/').filter(Boolean).pop() ?? 'dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  onToggleSidebar() {
    this.isOpenSidebar.set(!this.isOpenSidebar());
    this.toggleSidebar.emit(this.isOpenSidebar());
  }

  onToggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
    this.darkModeOutput.emit(this.isDarkMode());
  }

  signOut() {
    this.storage.clearAll();
    this.router.navigate(['/auth/sign-in']);
  }

}
