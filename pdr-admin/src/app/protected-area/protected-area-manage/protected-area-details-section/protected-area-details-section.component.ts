import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-protected-area-details-section',
  templateUrl: './protected-area-details-section.component.html',
  styleUrls: ['./protected-area-details-section.component.scss'],
})
export class ProtectedAreaDetailsSectionComponent implements OnChanges {
  @Input() data;

  private utils = new Utils();

  ngOnChanges(changes: SimpleChanges) {
    if (this.data) {
      if (changes['data'].currentValue?.effectiveDate) {
        this.data['effectiveDateDisplay'] = this.utils.formatDateForDisplay(changes['data'].currentValue?.effectiveDate);
      } else {
        this.data['effectiveDate'] = this.utils.formatDateForDisplay(this.data.sk);
      }
      this.data['repealedDate'] = this.utils.formatDateForDisplay(changes['data'].currentValue?.repealedDate);
    }
  }
}
