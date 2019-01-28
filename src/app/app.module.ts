import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule, MatDialogModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RoomSelectComponent } from './room-select/room-select.component';
import { CreateRoomDialog } from './room-select/room-select.component';
import { SocketService } from './services/common/socket.service';
import { SettingsService } from './services/common/settings.service';
import { ChatSocketService } from './services/chat/chatSocket.service'
import { ChatRtcService} from './services/chat/chat-rtc.service';
import { RtcService} from './services/common/rtc.service';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    RoomSelectComponent,
    CreateRoomDialog,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatInputModule,
  ],

  entryComponents: [
    RoomSelectComponent,
    CreateRoomDialog,
  ],

  providers: [SocketService, SettingsService, ChatSocketService, ChatRtcService, RtcService],
  bootstrap: [AppComponent]
})
export class AppModule { }
