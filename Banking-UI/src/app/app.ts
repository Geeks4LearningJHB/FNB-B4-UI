import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UiSettingsService } from './core/ui-settings.service';
import { SettingsModal } from './shared/settings-modal/settings-modal';
import { AiChat } from './shared/ai-chat/ai-chat';
import { RouteLoader } from './shared/route-loader/route-loader';
import { initials } from './core/format';

interface NavItem {
  label: string;
  path: string;
  icon: 'grid' | 'list' | 'card';
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SettingsModal, AiChat, RouteLoader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  ui = inject(UiSettingsService);

  // Placeholder identity display (no name field in the data model yet) — carried
  // over from the original FNB Sim shell rather than fabricated.
  readonly customerName = 'Customer Name';
  readonly avatarInitials = initials(this.customerName);

  sidebarOpen = false;
  settingsOpen = false;

  readonly nav: NavItem[] = [
    { label: 'Dashboard',       path: '/dashboard', icon: 'grid' },
    { label: 'Balance Enquiry', path: '/balance',   icon: 'list' },
    { label: 'Cards',           path: '/cards',     icon: 'card' },
  ];

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }
}
