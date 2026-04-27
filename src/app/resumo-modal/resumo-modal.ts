import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ResumoMatricula } from '../cadastro.types';

@Component({
  selector: 'app-resumo-modal',
  templateUrl: './resumo-modal.html',
  styleUrl: './resumo-modal.css',
})
export class ResumoModalComponent {
  @Input({ required: true }) resumo!: ResumoMatricula;
  @Output() fechar = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.fechar.emit();
  }

  onBackdropClick(): void {
    this.fechar.emit();
  }
}
