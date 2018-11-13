import { Component, OnInit, Output, Renderer2 } from '@angular/core';
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
	public pageSize = 50;
  private items: Array<IApplications> = [];
	public gridData: GridDataResult;
	public state: State = {
		skip: 0,
		take: 50
	}

	// GRID INFO
	private expand: number;
	private moreDetail: any;

	constructor(meta: Meta, title: Title, private api: API, private renderer: Renderer2) {
		title.setTitle('Product Information Management | phenomenex');

		// GRID
		this.getApps();
		this.expand = 0;
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
		this.api.get('grid.json', 'parts?$select=PartID,Brand,Description').subscribe(r => {
			this.items = r['value'];
          this.gridData = process(this.items, this.state);
          this.moreDetail = new Array<any>(r['value'].length);
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

	update(v) {
		this.items = v;
		this.gridData = process(this.items, this.state);
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

  moreInfo(v) {
		const a = v.dataItem.PartID;
		const q = `PartID,PartNumber,Technique,TechniqueCode,Class,ClassID,BrandCode,
		Phase,PhaseName,SubClass1,SubClass1Code,SubClass2,SubClass2Code,FilmThickness,
		ParticleSize,ProductType,UOM,Diameter,SorbentMass,Length,PriceLevel,Rating,
		IsStockItem,InventXStock,CreatedBy,CreatedOn,ModifiedOn,PartAttributeValues`

    this.api.get('grid.json', 'parts(' + a + ')?$select=' + q + '').subscribe(r => {
        this.moreDetail.splice(v.index, 1, r);
		});
	}
}
