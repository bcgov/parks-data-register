import { AfterViewInit, ChangeDetectorRef, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-info-section-row',
  templateUrl: './info-section-row.component.html',
  styleUrls: ['./info-section-row.component.scss']
})
export class InfoSectionRowComponent implements AfterViewInit{
  @Input() key: string = '-';
  @Input() set data(value) {
    this._data.next(value);
    this.cdr.detectChanges();
  }

  get data() {
    return this._data.value;
  }

  public _data = new BehaviorSubject(null);

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
}
