import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ProtectedAreaService } from '../services/protected-area.service';
import { Subscription } from 'rxjs';
import { Utils } from '../utils/utils';

@Component({
  selector: 'app-protected-area',
  templateUrl: './protected-area.component.html',
  styleUrls: ['./protected-area.component.scss'],
})
export class ProtectedAreaComponent implements OnInit, OnDestroy {
  // Input from route (Angular 16)
  @Input() id = '';

  private subscriptions = new Subscription();
  private utils = new Utils();

  currentData = null;
  state = 'details';

  constructor(private router: Router, private protectedAreaService: ProtectedAreaService) {
    this.subscriptions.add(
      this.router.events.subscribe((res) => {
        if (res instanceof NavigationEnd) {
          if (res.url.includes('edit')) {
            this.state = 'edit';
          } else {
            this.state = 'details';
          }
        }
      })
    );
  }

  ngOnInit() {
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        if (!res) {
          this.protectedAreaService.fetchData(this.id);
        }
        this.currentData = res;
        if (this.currentData && this.currentData.updateDate) {
          this.currentData.updateDate = this.utils.formatDateForDisplay(this.currentData.updateDate);
        }
      })
    );
  }

  navigate(path) {
    let route = ['protected-area', this.id];
    if (path) {
      route.push(path);
    }
    this.router.navigate(route);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
