import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule, MatDialogModule, MatInputModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RoomSelectComponent } from './room-select/room-select.component';
import { CreateRoomDialog } from './room-select/room-select.component';
import { EnterRoomDialog } from './room-select/room-select.component';
import { SocketService } from './services/common/socket.service';
import { SettingsService } from './services/common/settings.service';
import { ChatSocketService } from './services/chat/chatSocket.service'
import { RtcService } from './services/common/rtc.service';
import { AdminChatComponent } from './admin-chat/admin-chat.component';
import { UserChatComponent } from './user-chat/user-chat.component';
import { RtcChatAdminService } from './services/chat/rtc-chat-admin.service';
import { RtcChatUserService } from './services/chat/rtc-chat-user.service';
import { ServerLogComponent } from './server-log/server-log.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    RoomSelectComponent,
    CreateRoomDialog,
    EnterRoomDialog,
    AdminChatComponent,
    UserChatComponent,
    ServerLogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatInputModule,
    FormsModule,
  ],

  entryComponents: [
    RoomSelectComponent,
    CreateRoomDialog,
    EnterRoomDialog,
  ],

  providers: [SocketService, SettingsService, ChatSocketService, RtcService, RtcChatAdminService, RtcChatUserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
