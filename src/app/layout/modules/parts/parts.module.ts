import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// SHARED
import { PartsComponent } from './parts.component';

// KENDO
import { DialogModule } from '@progress/kendo-angular-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { RouterModule } from '@angular/router';

@NgModule({
	declarations: [
		PartsComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		DialogModule,
		BrowserAnimationsModule,
		InputsModule,
		RouterModule
	],
	exports: [
		PartsComponent
	],
})

export class PartsModule { }
