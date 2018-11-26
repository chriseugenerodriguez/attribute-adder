import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// SHARED
import { PartsComponent } from './parts.component';

// KENDO
import { DialogModule } from '@progress/kendo-angular-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { RouterModule } from '@angular/router';

// ALERT
import { AlertModule } from 'ngx-bootstrap/alert';

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
		RouterModule,
		FormsModule,

		AlertModule.forRoot(),
	],
	exports: [
		PartsComponent
	],
})

export class PartsModule { }
