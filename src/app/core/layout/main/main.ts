import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminAside } from '../../components/admin-aside/admin-aside';
import { AdminHeader } from '../../components/admin-header/admin-header';
import { UserRow } from '../../interfaces/users.interface';

@Component({
  imports: [
    RouterOutlet,
    AdminAside,
    AdminHeader,
  ],
  selector: 'app-main',
  styleUrl: './main.css',
  templateUrl: './main.html',
})
export class Main {

  user = signal<UserRow>({
    id: '',
    rut: 0,
    dv: '',
    name: '',
    lastname: '',
    email: '',
    role: 'admin',
    isActive: true,
    password: '',
  });

  isDarkMode = signal(true);
  //style = signal('dark flex h-screen overflow-hidden bg-[var(--hap-bg)] text-[var(--hap-text-primary)]');
  style = computed(() => {
    if(this.isDarkMode()) {
      return 'dark flex h-screen overflow-hidden bg-[var(--hap-bg)] text-[var(--hap-text-primary)]';
    }else{
      return 'light flex h-screen overflow-hidden bg-[var(--hap-bg)] text-[var(--hap-text-primary)]';
    }
  });
  
  isOpenSidebar = signal(true);

  onToggleSidebar(isOpenSidebar: boolean) {
    console.log({ isOpenSidebar });
    this.isOpenSidebar.set(isOpenSidebar);
  }

  onToggleDarkMode(isDarkMode: boolean) {
    this.isDarkMode.set(isDarkMode);
  }
  
}
