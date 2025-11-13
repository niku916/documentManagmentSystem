import { Component, HostBinding, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';

import { FormControl } from '@angular/forms';
// import { OverlayContainer } from '@angular/cdk/overlay';

import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor() { }

  ngOnInit() {

  }
  getFileUpload() {
    alert('nishant')
  }
}
