import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-nav-card',
  templateUrl: './nav-card.component.html',
  styleUrls: ['./nav-card.component.scss'],
})
export class NavCardComponent implements OnInit {
  @Input() cardHeader;
  @Input() cardTitle;
  @Input() cardText;
  @Input() navigation;
  @Input() relative: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void { }

  navigate(nav) {
    if (this.relative) {
      this.router.navigate([nav], { relativeTo: this.route });
    } else {
      this.router.navigate([nav]);
    }
  }
}
