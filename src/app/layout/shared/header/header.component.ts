import { Component, OnInit, ViewChild, Output } from '@angular/core';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {


	AOpened: boolean;
	EOpened: boolean;
	UOpened: boolean;

	constructor() {

	
		this.AOpened = false;
		this.EOpened = false;
		this.UOpened = false;

	}

	popup(v) {
		if (v === 'attributes') {
			this.AOpened = true;
		}
		if (v === 'export') {
			this.EOpened = true;
		}
		if (v === 'units') {
			this.UOpened = true;
		}
	}

	attributes(v): boolean {
		return this.AOpened = v;
	}

	export(v): boolean {
		return this.EOpened = v;
	}

	units(v): boolean {
		return this.UOpened = v;
	}

	ngOnInit() {
	}

}
