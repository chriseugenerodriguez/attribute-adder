import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

// SHARED
import { HomeComponent } from './home.component';

// KENDO UI
import { DialogModule } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LayoutModule } from '@progress/kendo-angular-layout';

import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// MODULES
import { FilterModule } from './modules/filter/filter.module';
import { PartsModule } from './modules/parts/parts.module';

// PIPE
import { KeysPipeModule } from 'app/core';

@NgModule({
	declarations: [
		HomeComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		GridModule,
		RouterModule,
		DialogModule,
		BrowserAnimationsModule,
		DropDownsModule,
		LayoutModule,

		// MODULES
		PartsModule,
		FilterModule,

		// PIPE
		KeysPipeModule
	],
	exports: [
		GridModule
	],
})

export class HomeModule { }
