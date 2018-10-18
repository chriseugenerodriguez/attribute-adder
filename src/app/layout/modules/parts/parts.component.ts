import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { IAttribute, API } from '../../../core/index';
import { HomeComponent } from '../../home.component';

@Component({
	selector: 'parts',
	templateUrl: './parts.component.html'
})
export class PartsComponent implements OnInit {

	// TOGGLE
	@Output() open = new EventEmitter<boolean>(true);

	// PARTS
	private attributes: Array<IAttribute> = [];
	private dataAttribute: Array<IAttribute> = [];
	private attributeFeatures: Array<object> = [];
	private showAttributes: boolean = true;
	private selectedAttribute: {};

	private view: boolean;
	private showFeatures: boolean = false;
	private featureList: Array<any> = [];
	private feature: string = '';

	constructor(private api: API, private HC: HomeComponent) {
	}

	ngOnInit() {
		// PARTS
		this.api.get('./export/attributes.json', 'image').subscribe(r => {
			this.attributes = r;
			this.dataAttribute = r.slice();
		});
	}

	private resetSearch() {
		this.dataAttribute = this.attributes;
	}

	private parts(status) {
		this.resetSearch();

		if (status === 'main') {
			this.showFeatures = false;
			this.showAttributes = true;
		}

		if (status === 'cancel') {
			this.open.emit(false);
			this.view = false;
		}

		if (status === 'add') {
			const a = {part: this.HC.part, attributeParent: this.selectedAttribute, attributeChild: this.featureList};

			this.api.post('parts', a).subscribe(r => {
				console.log(r);
			});

			this.open.emit(false)
			this.view = false;
		}
	}

	private selectedFeature(v, t) {
		const a = this.featureList.find(e => e.step === v.step);
		const b = this.featureList.findIndex(e => e.step === v.step);

		if (t === 'radio') {
			this.featureList = [];

			this.featureList.push(v);
		} else {

			if (!a) {
				this.featureList.push(v);
			}
			if (a) {
				this.featureList.splice(b, 1);
			}
		}
	}

	public selectionChange(obj) {
		const a = obj.target.value;
		this.dataAttribute = this.attributes.filter((s) => s.value.toLowerCase().indexOf(a.toLowerCase()) !== -1);
	}

	public manageAttribute(attr) {
		this.selectedAttribute = attr;
		this.showAttributes = false;
		this.showFeatures = true;
		this.featureList = [];

		if (attr.type === 'number' || (attr.type === 'string' && attr.file === false)) {
			this.api.get('./attributes/data.json', 'attributes').subscribe(r => {
				this.attributeFeatures = r;
			});
		};
	}
}
