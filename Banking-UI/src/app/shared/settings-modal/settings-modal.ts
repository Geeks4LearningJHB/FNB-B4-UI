import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.scss',
})
export class SettingsModal {
  @Input() open = false;
  @Input() darkMode = false;
  @Input() hideBalance = false;
  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() hideBalanceChange = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<void>();

  fontSteps = [80, 90, 100, 110, 120, 130];
  fontSize = 100;

  toggleDark(val: boolean) { this.darkModeChange.emit(val); }

  toggleHideBalance(val: boolean) { this.hideBalanceChange.emit(val); }

  increaseFont() {
    const idx = this.fontSteps.indexOf(this.fontSize);
    if (idx < this.fontSteps.length - 1) {
      this.fontSize = this.fontSteps[idx + 1];
      document.documentElement.style.fontSize = this.fontSize + '%';
    }
  }

  decreaseFont() {
    const idx = this.fontSteps.indexOf(this.fontSize);
    if (idx > 0) {
      this.fontSize = this.fontSteps[idx - 1];
      document.documentElement.style.fontSize = this.fontSize + '%';
    }
  }

  close() { this.closeModal.emit(); }
}
