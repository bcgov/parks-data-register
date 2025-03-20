import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-info-section',
    templateUrl: './info-section.component.html',
    styleUrls: ['./info-section.component.scss'],
    standalone: false
})
export class InfoSectionComponent implements OnInit {
  @Input() title: string = '';
  @Input() id: string = '';

  protected static idCounter: number = 0;

  ngOnInit() {
    const name = this.title.toLowerCase().replace(' ', '-') || 'info-section';
    this.id = `${name}-${InfoSectionComponent.idCounter++}`;
  }
}
