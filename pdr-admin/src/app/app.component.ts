import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private subscriptions = new Subscription();

  title = 'pdr-admin';
  showSideBar = false;
  showBreadCrumb = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          if (this.activatedRoute && this.activatedRoute.firstChild) {
            const routeData = this.activatedRoute.firstChild.snapshot.data;
            this.showSideBar = routeData['showSideBar'] !== false;
            this.showBreadCrumb = routeData['showBreadCrumb'] !== false;
          }
        }
      })
    );
  }

  test(){
    console.log("THIS IS A TEST FUNCTION");
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
