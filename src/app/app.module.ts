import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RoomSelectComponent } from './room-select/room-select.component';
import { SocketService } from './services/socket.service';
import { SettingsService } from './services/settings.service';
import { ChatService } from './services/chat.service'

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    RoomSelectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [SocketService, SettingsService, ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
