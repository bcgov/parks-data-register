import { Component, Input, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ProtectedAreaService } from '../services/protected-area.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-protected-area',
  templateUrl: './protected-area.component.html',
  styleUrls: ['./protected-area.component.scss'],
})
export class ProtectedAreaComponent implements OnDestroy {
  // Input from route (Angular 16)
  @Input() id = '';

  private subscriptions = new Subscription();

  currentData = null;
  state = 'details';

  constructor(private router: Router, private protectedAreaService: ProtectedAreaService) {
    this.protectedAreaService.fetchData();
    this.subscriptions.add(
      this.protectedAreaService.watchCurrentProtectedArea().subscribe((res) => {
        this.currentData = res;
      })
    );
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
