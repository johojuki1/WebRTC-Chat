import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../services/common/settings.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(
    private router: Router,
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

  resetAdminValue() {
    this.settingsService.setAdminName('default');
  }

}
