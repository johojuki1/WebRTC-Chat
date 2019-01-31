import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomSelectComponent } from './room-select/room-select.component';
import { AdminChatComponent } from './admin-chat/admin-chat.component';
import { UserChatComponent } from './user-chat/user-chat.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    component: RoomSelectComponent
  },
  {
    path: 'chat/admin',
    component: AdminChatComponent
    
  },
  {
    path: 'chat/user',
    component: UserChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
