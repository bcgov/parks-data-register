import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-protected-area',
    templateUrl: './protected-area.component.html',
    styleUrls: ['./protected-area.component.scss'],
    standalone: false
})
export class ProtectedAreaComponent implements OnInit {
  private subscriptions = new Subscription();

  showSearch = false;

  constructor(private breadcrumbService: BreadcrumbService, private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.breadcrumbService.breadcrumbs.subscribe((res) => {
        if (res) {
          if (res[res.length - 1]?.label === 'Protected Areas') {
            this.showSearch = true;
          } else {
            this.showSearch = false;
          }
          this.ref.detectChanges();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.ref.detectChanges();
  }
}
