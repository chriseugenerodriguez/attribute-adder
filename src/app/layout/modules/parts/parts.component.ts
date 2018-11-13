import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { IAttribute, API } from '../../../core/index';
import { HomeComponent } from '../../home.component';

import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'parts',
	templateUrl: './parts.component.html'
})
export class PartsComponent implements OnInit {

	// MESSAGE
	message: Array<object> = [];

	// DATA
	@Input() part;

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
	private featureList: any;
	private feature: string = '';

	// ASSOCIATIONS
	count: any;
	selectedAttributes: any;

	constructor(private api: API, private HC: HomeComponent) {
	}

	ngOnInit() {

		// PARTS
		this.api.get('./export/attributes.json', 'Attributes?$expand=AttributeType,UnitOfMeasure').subscribe(r => {
			this.attributes = r['value'];

			for (const x of r['value']) {
				if (x.UOMKey != null) {
					this.dataAttribute.push(x);
				} else {
					this.dataAttribute.push(x);
				}
			}
		});

		// COUNT
		if (this.part.length === 1) {
			this.api.get('./export/attributes.json', 'parts(' + this.part[0].Id + ')/getselectedattributescount').subscribe((r) => {
				this.count = r;
			})
		}
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
			const fl = [];
			const pi = [];

			for (const i of this.HC.part) {
				pi.push(i.Id);
			}
			for (const i of this.featureList) {
				fl.push(i.AttributeValueID);
			}

			const a = { attributeId: this.selectedAttribute['AttributeID'], attributeValueIds: fl, partIds: pi }

			this.api.post('parts/Default.AssociateParts', a).subscribe(
				(r) => {
					this.alert('success', 'This has been successfully associated');

					this.showFeatures = false;
					this.showAttributes = true;
				},
				(err) => {
					this.alert('error', err['status'] + ' - ' + err['statusText'])
				}
			);
		}
	}

	private _selectedFeature(v, t) {
		const a = this.featureList.find(e => e === v);
		const b = this.featureList.findIndex(e => e === v);

		if (t === 'radio') {
			if (a) {
				this.featureList.splice(b, 1);
			}
			this.featureList.push(v);
		} else {

			if (a) {
				this.featureList.splice(v);
			}
			this.featureList.push(v);
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

		this.api.get('./attributes/data.json', 'Attributes(' + attr.AttributeID + ')/getattributevalues').subscribe(r => {
			this.attributeFeatures = r['value'];
		});

		// COUNT > 1 OVERWRITE ALL
		if (this.part.length === 1) {
			this.api.get('./attributes/data.json', 'parts(' + this.part[0].Id + ')?$expand=*&$select=PartAttributeValues').subscribe(res => {
				if (res['PartAttributeValues'] !== []) {
					for (const i of res['PartAttributeValues']) {
						if (i.AttributeID === attr.AttributeID) {
							this.selectedAttributes = i;
							this.featureList.push(i.AttributeValueID);
						}
					}
				}
				this.featureList = [];
				this.selectedAttributes = 0;
			});
		} else {
			this.featureList = [];
			this.selectedAttributes = 0;
		}
	}

	public selected(v): boolean {
		let a = false;
		const b = this.selectedAttributes;
		if (b !== 0) {
			if (v === b.AttributeValueID) {
				a = true;
			}
		}

		return a;
	}

	alert(a, b) {
		this.message.push({
			type: a,
			value: b
		})
	}

	close(a: AlertComponent) {
		this.message = this.message.filter((i) => i !== a);
	}
}
