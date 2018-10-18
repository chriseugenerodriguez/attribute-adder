import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { API, ILookup } from '../../../core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import 'rxjs/Rx';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'export',
	templateUrl: './exports.component.html'
})
export class ExportsComponent implements OnInit {
	// TOGGLE
	@Output() open = new EventEmitter<boolean>(true);

	// FORMGROUP
	Export: FormGroup;
	Save: FormGroup;

	// NEW
	new: boolean;
	default: boolean;

	// MESSAGE
	message: Array<object> = [];

	listAttrTypes: Array<string> = ['string', 'number', 'image'];

	// EXPORT
	removeItemsActive: boolean;
	addItemsActive: boolean;
	addI: Array<object> = [];
	removeI: Array<object> = [];
	addClicked = [];
	removeClicked = [];

	inputs: Array<object> = [];
	outputs: Array<object> = [];

	// EXPORT Data
	priceType: Array<ILookup>;
	imageType: Array<ILookup>;
	exportType: Array<ILookup>;
	accountType: Array<ILookup>;

	priceTypeData: Array<ILookup>;
	imageTypeData: Array<ILookup>;
	exportTypeData: Array<ILookup>;
	accountTypeData: Array<ILookup>;

	price: Array<object> = [];
	images: Array<object> = [];
	exports: Array<object> = [];

	public defaultAttributes: { text: string, value: number } = { text: 'Attributes', value: 1 };

	public attributes: Array<{ text: string, value: number }> = [
		{ text: 'AX', value: 2 },
	];

	constructor(private api: API, private fb: FormBuilder) {

		this.removeItemsActive = false;
		this.addItemsActive = false;

		this.default = true;

		// FORM GROUPS
		this.Export = this.fb.group({
			Accounttype: [''],
			Currencytype: ['', Validators.required],
			Imagetype: ['', Validators.required],
			Exporttype: ['', Validators.required],
			Attributes: ['', Validators.required],
		});

		this.Save = this.fb.group({
			Value: ['', Validators.required]
		});
	}

	ngOnInit(): void {

		// EXPORT -  move later
		this.api.get('./export/account.json', 'image').subscribe(r => {
			this.accountType = r;
			this.accountTypeData = r;
		});

		this.api.get('./export/image.json', 'image').subscribe(r => {
			this.imageType = r;
			this.imageTypeData = r;
		});

		this.api.get('./export/export.json', 'export').subscribe(r => {
			this.exportType = r;
			this.exportTypeData = r;
		});

		this.api.get('./export/price.json', 'price').subscribe(r => {
			this.priceType = r;
			this.priceTypeData = r;
		});

		this.api.get('./export/attributes.json', 'image').subscribe(r => {
			this.inputs = r;
		});
	}

	attributeChange(v) {
		if (v.text === 'AX') {
			this.api.get('./export/attributes.json', 'image').subscribe(r => {
				this.inputs = r;
			});
		} else {
			this.api.get('./export/attributes.json', 'image').subscribe(r => {
				this.inputs = r;
			});
		}
	}

	export(status) {
		if (status === 'cancel') {
			this.open.emit(false);

			this.Export.reset();
		}

		if (status === 'create-cancel') {
			this.new = false;
			this.default = true;

			this.Save.reset();
		}

		if (status === 'confirm') {
			this.api.post('./export/attributes.json', 'export/' + this.Export.value).subscribe(r => {
				const blob = new Blob([r], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				window.open(url);
			});
		}

		if (status === 'save') {
			if (this.Export.controls['Accounttype'].value) {
				if (status === 'save-confirm') {
					this.api.put('export/' + this.Export.value.id, this.Export.value).subscribe(
						(r) => {
							if (r) {
								this.new = false;
								this.default = true;
								this.Export.reset();

								this.alert('success', r['statusText'])
							}
						},
						(err) => {
							this.alert('error', err['status'] + ' - ' + err['statusText'])
						})
				}
			} else {
				this.new = true;
				this.default = false;
			}
		}

		if (status === 'create') {

			const a = {
				'Title': this.Save.value,
				'Form': this.Export.value
			}

			this.api.post('export/', a).subscribe(
				(r) => {
					if (r) {
						this.new = false;
						this.default = true;
						this.Export.reset();

						this.alert('success', r['statusText'])
					}
				},
				(err) => {
					this.alert('error', err['status'] + ' - ' + err['statusText'])
				})
		}

	}

	addItems() {
		if (this.addI.length > 1) {
			for (let i = 0; i < this.addI.length; i++) {
				const d = this.addI;
				this.outputs.push(d[i]);
				this.Export.controls['Attributes'].setValue(this.outputs);

				const index = this.inputs.filter(function (el) {
					return el['value'] !== d[i]['value'].toString();
				});

				this.inputs = index;
			}
		} else {
			const d = this.addI[0];

			this.outputs.push(d);
			this.Export.controls['Attributes'].setValue(this.outputs);

			const index = this.inputs.filter(function (el) {
				return el['value'] !== d['value'].toString();
			});

			this.inputs = index;
		}

		this.addI = [];
		this.addItemsActive = false;
	}

	addItem(i) {
		if (this.addI !== []) {
			this.addItemsActive = true;
			if (this.addI.indexOf(i) === -1) {
				this.addI.push(i);
			}
		}

	}

	removeItems() {
		if (this.removeI.length > 1) {
			for (let i = 0; i < this.removeI.length; i++) {
				const d = this.removeI;

				this.inputs.push(d[i]);

				const index = this.outputs.filter(function (el) {
					return el['value'] !== d[i]['value'].toString();
				});

				this.outputs = index;
				this.Export.controls['Attributes'].setValue(this.outputs);
			}
		} else {
			const d = this.removeI[0];

			this.inputs.push(d);

			const index = this.outputs.filter(function (el) {
				return el['value'] !== d['value'].toString();
			});

			this.outputs = index;
			this.Export.controls['Attributes'].setValue(this.outputs);
		}

		this.removeI = [];
		this.removeItemsActive = false;
	}

	removeItem(i) {
		if (this.removeI !== []) {
			this.removeItemsActive = true;
			if (this.removeI.indexOf(i) === -1) {
				this.removeI.push(i);
			}
		}
	}

	accountChange(i) {
		const a = i['key'];

		this.api.get('./export/attributes.json', 'export/' + a).subscribe(r => {

			this.Export.controls['Currencytype'].setValue(r['Currencytype']);
			this.Export.controls['Imagetype'].setValue(r['Imagetype']);

			this.outputs = r['Inputs'];
			this.outputs = r['Outputs'];
		});
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

	accountTypeFilter(val) {
		this.accountTypeData = this.accountType.filter((s) => s.Value.toLowerCase().indexOf(val.toLowerCase()) !== -1);
	}

	priceTypeFilter(val) {
		this.priceTypeData = this.priceType.filter((s) => s.Value.toLowerCase().indexOf(val.toLowerCase()) !== -1);
	}

	imageTypeFilter(val) {
		this.imageTypeData = this.imageType.filter((s) => s.Value.toLowerCase().indexOf(val.toLowerCase()) !== -1);
	}

	exportTypeFilter(val) {
		this.exportTypeData = this.exportType.filter((s) => s.Value.toLowerCase().indexOf(val.toLowerCase()) !== -1);
	}
}
