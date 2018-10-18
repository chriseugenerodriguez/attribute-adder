import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

// SHARED
import { HeaderComponent } from './header.component';

// KENDO UI
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputsModule } from '@progress/kendo-angular-inputs';

// MODULES
import { UnitsModule } from '../../modules/units/units.module';
import { ExportsModule } from '../../modules/exports/exports.module';
import { AttributesModule } from '../../modules/attributes/attributes.module';

@NgModule({
	declarations: [
		HeaderComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		DialogModule,
		BrowserAnimationsModule,
		DropDownsModule,
		InputsModule,

		// MODULES
		UnitsModule,
		ExportsModule,
		AttributesModule
	],
	exports: [
		HeaderComponent
	],
})

export class HeaderModule { }
