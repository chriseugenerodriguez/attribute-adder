import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// SHARED
import { FilterComponent } from './filter.component';

// KENDO
import { DialogModule } from '@progress/kendo-angular-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ALERT
import { AlertModule } from 'ngx-bootstrap/alert';

@NgModule({
	declarations: [
		FilterComponent
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

	
		AlertModule.forRoot()
	],
	exports: [
		FilterComponent
	],
})

export class FilterModule { }
