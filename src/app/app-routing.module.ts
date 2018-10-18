import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './layout/home.component';

@NgModule({
	imports: [
		RouterModule.forRoot([
			{ path: '', component: HomeComponent }
		])
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
