import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-protected-area-manage',
  templateUrl: './protected-area-manage.component.html',
  styleUrls: ['./protected-area-manage.component.scss'],
})
export class ProtectedAreaManageComponent implements OnInit {
  @Input() id;

  private subscriptions = new Subscription();
  private utils = new Utils();

  public currentData;
  public state = 'details';
  public showDetails;

  constructor(
    private router: Router,
    private protectedAreaService: ProtectedAreaService,
    private breadcrumbService: BreadcrumbService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        if (!res) {
          this.protectedAreaService.fetchData(this.id);
        } else {
          this.currentData = res ? res : {};
          if (this.currentData.updateDate) {
            this.currentData.updateDate = this.utils.formatDateForDisplay(this.currentData.updateDate);
          }
          this.ref.detectChanges();
        }
      })
    );

    this.subscriptions.add(
      this.breadcrumbService.breadcrumbs.subscribe((res) => {
        if (res) {
          if (res[res.length - 1]['altLabel'] === 'Details') {
            this.showDetails = true;
            this.state = 'details';
          } else {
            this.showDetails = false;
            this.state = 'edit';
          }
          this.ref.detectChanges();
        }
      })
    );
  }

  navigate(path) {
    let route = ['protected-areas', this.id];
    if (path) {
      route.push(path);
    }
    this.state = path;
    this.router.navigate(route);
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.ref.detectChanges();
  }
}
