import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { UnitsComponent } from './units.component';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ALERT
import { AlertModule } from 'ngx-bootstrap/alert';

@NgModule({
	declarations: [
		UnitsComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		DialogModule,
		BrowserAnimationsModule,
		DropDownsModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,

	
		AlertModule.forRoot(),
	],
	exports: [
		UnitsComponent
	],
})

export class UnitsModule { }
