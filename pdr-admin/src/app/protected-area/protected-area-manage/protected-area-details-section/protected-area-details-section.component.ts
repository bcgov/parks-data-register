import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-protected-area-details-section',
  templateUrl: './protected-area-details-section.component.html',
  styleUrls: ['./protected-area-details-section.component.scss'],
})
export class ProtectedAreaDetailsSectionComponent {
  @Input() data;
  @Input() title: string = '';
}
