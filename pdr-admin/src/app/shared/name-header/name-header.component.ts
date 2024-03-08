import { Component, Input } from '@angular/core';
import { Utils } from 'src/app/utils/utils';

export interface headerData {
  displayId?: string,
  legalName?: string,
  interactionTemplate?: any,
  status?: string,
  type?: string,
  effectiveDateDisplay?: string,
  updateDateDisplay?: string
}

@Component({
  selector: 'app-name-header',
  templateUrl: './name-header.component.html',
  styleUrls: ['./name-header.component.scss']
})
export class NameHeaderComponent {
  @Input() headerData: headerData;

  public utils = new Utils();
}
