import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent }   from './help/help.component';
import { KickstartFormComponent } from './kickstart-form/kickstart-form.component'
import { KitFormComponent } from './kit-form/kit-form.component'

const routes: Routes = [
  { path: '', redirectTo: '/kickstart', pathMatch: 'full' },
  { path: 'kickstart', component: KickstartFormComponent },
  { path: 'kit_configuration', component: KitFormComponent },
  { path: 'help', component: HelpComponent },
  // { path: 'detail/:id', component: HeroDetailComponent },
  // { path: 'heroes', component: HeroesComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
