import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

// SHARED
import { AttributesComponent } from './attributes.component';

// KENDO
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UploadModule } from '@progress/kendo-angular-upload';
import { HttpClientModule } from '@angular/common/http';
import { AlertModule } from 'ngx-bootstrap/alert';

@NgModule({
	declarations: [
		AttributesComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		DialogModule,
		BrowserAnimationsModule,
		DropDownsModule,
		InputsModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		UploadModule,
		HttpClientModule,

		AlertModule
	],
	exports: [
		AttributesComponent
	],
})

export class AttributesModule { }
