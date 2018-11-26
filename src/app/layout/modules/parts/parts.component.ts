import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { IAttribute, API } from '../../../core/index';
import { HomeComponent } from '../../home.component';

import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'parts',
	templateUrl: './parts.component.html'
})
export class PartsComponent implements OnInit {

	message: Array<object> = [];

	@Input() part;
	@Output() open = new EventEmitter<boolean>(true);

	private attributes: Array<IAttribute> = [];
	private dataAttribute: Array<IAttribute> = [];
	private attributeFeatures: Array<object> = [];
	private showAttributes: boolean = true;
	private selectedAttribute: {};

	private view: boolean;
	private showFeatures: boolean = false;
	private featureList = new Array();
	private feature: string = '';

	count: any;
	selectedAttributes: any;

	constructor(private api: API, private HC: HomeComponent) {
	}

	ngOnInit() {

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

		if (this.part.length === 1) {
			this.api.get('./export/attributes.json', 'parts/GetSelectedAttributesCount(key=' + this.part[0].Id + ')').subscribe((r) => {
				this.count = r['value'];
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

			this.api.post('parts/AssociateParts', a).subscribe(
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
		const a = this.featureList.find(e => e.AttributeValueID === v.AttributeValueID);
		const b = this.featureList.findIndex(e => e.AttributeValueID === v.AttributeValueID);

		if (t === 'radio') {
			this.featureList.length = 0;
			this.featureList.push(v);
		} else {
			if (a) {
				return this.featureList.splice(b, 1);
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

		this.featureList = [];
		this.selectedAttributes = [];

		this.api.get('./attributes/data.json', 'Attributes(' + attr.AttributeID + ')/getattributevalues').subscribe(r => {
			this.attributeFeatures = r['value'];

			if (this.part.length === 1) {
				this._featureAttributes(this.attributeFeatures).then(
					(res) => {
						if (this.attributeFeatures.length > 0) {
							this.featureList = res;
							this.selectedAttributes = res;
						} else {
							this.featureList.push(res);
							this.selectedAttributes.push(res);
						}
					},
					(err) => {
						this.featureList = [];
						this.selectedAttributes = [];
					}
				);
			}
		});
	}

	private _featureAttributes(val): Promise<any> {
		const b = [];
		const a = new Promise((resolve, reject) => {
			this.api.get('./attributes/data.json', 'parts(' + this.part[0].Id + ')?$expand=*&$select=PartAttributeValues').subscribe(res => {
				if (res['PartAttributeValues'] !== []) {
					for (const i of res['PartAttributeValues']) {
						if (val.length > 0) {
							for (const x of val) {
								if (i.AttributeValueID === x.AttributeValueID) {
									b.push(i);
								}
							}
							resolve(b);
						} else {
							if (i.AttributeValueID === val.AttributeValueID) {
								resolve(i);
							}
						}
					}
				} else {
					reject(null);
				}
			});
		});

		return a;
	}

	public selected(v): boolean {
		const b = this.selectedAttributes;
		if (b !== undefined) {
			if (b.length > 0) {
				for (const i of b) {
					if (v === i.AttributeValueID) {
						return true;
					}
				}
			}
		}
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
