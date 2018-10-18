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
		RouterModule
	],
	exports: [
		FilterComponent
	],
})

export class FilterModule { }
