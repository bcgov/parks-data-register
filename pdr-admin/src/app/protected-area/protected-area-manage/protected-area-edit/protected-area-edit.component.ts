import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-protected-area-edit',
  templateUrl: './protected-area-edit.component.html',
  styleUrls: ['./protected-area-edit.component.scss'],
})
export class ProtectedAreaEditComponent implements OnInit {
  private subscriptions = new Subscription();

  showEdit = false;

  constructor(private breadcrumbService: BreadcrumbService, private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.breadcrumbService.breadcrumbs.subscribe((res) => {
        if (res) {
          if (res[res.length - 1]?.label === 'Edit') {
            this.showEdit = true;
          } else {
            this.showEdit = false;
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
