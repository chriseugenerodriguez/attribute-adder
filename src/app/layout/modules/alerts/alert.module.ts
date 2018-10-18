import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// SHARED
import { AlertsComponent } from './alert.component';

// KENDO
import { AlertModule } from 'ngx-bootstrap/alert';

@NgModule({
	declarations: [
		AlertsComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		AlertModule
	],
	exports: [
		AlertsComponent
	],
})

export class AlertsModule { }
