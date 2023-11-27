import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { ProtectedAreaService } from 'src/app/services/protected-area.service';

@Component({
  selector: 'app-protected-area-edit-repeal',
  templateUrl: './protected-area-edit-repeal.component.html',
  styleUrls: ['./protected-area-edit-repeal.component.scss'],
})
export class ProtectedAreaEditRepealComponent {
  @Input() id;
  private subscriptions = new Subscription();

  public currentData;
  public loading = true;

  constructor(
    private router: Router,
    private protectedAreaService: ProtectedAreaService,
    private loadingService: LoadingService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        this.currentData = res ? res : {};
        this.ref.detectChanges();
      })
    );

    this.subscriptions.add(
      this.loadingService.getLoadingStatus().subscribe((res) => {
        this.loading = res;
        this.ref.detectChanges();
      })
    );
  }

  cancel() {
    this.router.navigate(['protected-areas', this.currentData.pk, 'edit']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.ref.detectChanges();
  }
}
