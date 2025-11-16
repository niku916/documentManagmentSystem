import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
  <div class="overlay" *ngIf="show">
    <div class="spinner">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <div class="text">{{ text || 'Processing...' }}</div>
  </div>
  `,
  styles: [`
  .overlay{
    position:fixed; inset:0; background: rgba(11,18,28,0.18);
    display:flex; align-items:center; justify-content:center; z-index: 9999; flex-direction: column;
  }
  .spinner{display:flex; gap:8px; transform: translateY(-6px);}
  .dot{width:12px;height:12px;border-radius:50%;background:#0b6f82; animation: bounce 0.8s infinite;}
  .dot:nth-child(2){animation-delay:0.12s}
  .dot:nth-child(3){animation-delay:0.24s}
  .text{margin-top:10px;color:#033; font-weight:600}
  @keyframes bounce{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
  `]
})
export class SpinnerComponent {
  @Input() show = false;
  @Input() text?: string;
}
