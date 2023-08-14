import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'pdr-admin';
  showSideBar = false;
  showBreadCrumb = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.activatedRoute && this.activatedRoute.firstChild) {
          const routeData = this.activatedRoute.firstChild.snapshot.data;
          this.showSideBar = routeData['showSideBar'] !== false;
          this.showBreadCrumb = routeData['showBreadCrumb'] !== false;
        }
      }
    });
  }
}
