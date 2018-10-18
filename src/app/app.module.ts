import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// PAGES
import { HomeModule } from './layout/home.module';
import { API } from './core';
import { HeaderModule } from './layout/shared/index';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		AppRoutingModule,
		HomeModule,
		HeaderModule
	],
	providers: [
		API
	],
	bootstrap: [AppComponent]
})

export class AppModule { }
