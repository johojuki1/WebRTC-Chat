import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomSelectComponent } from './room-select/room-select.component';


const routes: Routes = [
  {
    path: 'chat',
    component: RoomSelectComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
