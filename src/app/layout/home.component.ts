import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

// KENDO UI
import { process, State, filterBy } from '@progress/kendo-data-query';

import { IApplications, API } from '../core/index';
import { PageChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';

@Component({
	selector: module.id,
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

	// PARTS
	@Output() part: Array<{ 'Id': number }> = [];

	// TOGGLE
	POpened: boolean;
	FOpened: boolean;

	// GRID
	private images: Array<object> = [];
	public skip = 0;
	public pageSize = 10;
	private items: Array<IApplications> = [];
	public gridData: GridDataResult;
	public state: State = {
		skip: 0,
		take: 10
	}

	constructor(meta: Meta, title: Title, private api: API) {
		title.setTitle('Product Information Management | phenomenex');

		// GRID
		this.getApps();

		this.api.get('grid.json', 'grid').subscribe(r => {
			this.images = r['data'];
		});

	}

	// MODULE FUNCTIONS
	popup(v) {
		if (v === 'parts') {
			this.POpened = true;
		}
		if (v === 'filter') {
			this.FOpened = true;
		}
	}

	// GRID FUNCTIONS
	public pageChange(event: PageChangeEvent): void {
		this.skip = event.skip;
		this.gridData = process(this.items, this.state);
	}

	public getApps(): void {
		this.api.get('grid.json', 'grid').subscribe(r => {
			this.items = r['data'];
			this.gridData = process(this.items, this.state);
		});
	}

	ngOnInit() {
	}

	filter(v): boolean {
		return this.FOpened = v;
	}

	parts(v): boolean {
		return this.POpened = v;
	}

	partSelect(v) {
		const a = this.part.find(e => e.Id === v);
		const b = this.part.findIndex(e => e.Id === v);

		if (!a) {
			this.part.push({ 'Id': v });
		}
		if (a) {
			this.part.splice(b, 1);
		}
	}
}
