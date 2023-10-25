import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-protected-area-edit',
  templateUrl: './protected-area-edit.component.html',
  styleUrls: ['./protected-area-edit.component.scss'],
})
export class ProtectedAreaEditComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  // navigate(path) {
  //   let route = ['protected-area', this.id];
  //   if (path) {
  //     route.push(path);
  //   }
  //   this.router.navigate(route, this.route.);
  // }
}
