import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { API, ILookup } from '../../../core';

import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';

import 'rxjs/Rx';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'export',
	templateUrl: './exports.component.html'
})
export class ExportsComponent implements OnInit {

	@Output() open = new EventEmitter<boolean>(true);

	Export: FormGroup;
	Save: FormGroup;

	new: boolean;
	default: boolean;

	message: Array<object> = [];

	listAttrTypes: Array<string> = ['string', 'number', 'image'];

	removeItemsActive: boolean;
	addItemsActive: boolean;
	addI: Array<object> = [];
	removeI: Array<object> = [];
	addClicked = [];
	addClickedAX = [];
	removeClicked = [];

	inputs: Array<object> = [];
	outputs: Array<object> = [];

	priceType: Array<ILookup>;
	fileType: Array<ILookup>;
	exportType: Array<ILookup>;
	accountType: Array<ILookup>;

	priceTypeData: Array<ILookup>;
	fileTypeData: Array<ILookup>;
	exportTypeData: Array<ILookup>;
	accountTypeData: Array<ILookup>;

	price: Array<object> = [];
	images: Array<object> = [];
	exports: Array<object> = [];

	ProfileAttributes: any;
	ProfilePartFields: any;

	type: string;
	update: boolean;

	public defaultAttributes: { text: string, value: number } = { text: 'Attributes', value: 1 };
	public selectedAttributes: { text: string, value: number } = { text: 'Attributes', value: 1 };

	public attributes: Array<{ text: string, value: number }> = [
		{ text: 'AX', value: 2 },
	];

	constructor(private api: API, private fb: FormBuilder) {

		this.removeItemsActive = false;
		this.addItemsActive = false;

		this.default = true;

		this.Save = this.fb.group({
			ProfileName: [null, Validators.required]
		});

		this.Export = this.fb.group({
			ProfileId: [''],
			PriceListKey: ['', Validators.required],
			FileTypeKey: ['', Validators.required],
			ExportFormatKey: ['', Validators.required],
			ProfileAttributes: this.fb.array([], Validators.required),
			ProfilePartFields: this.fb.array([], Validators.required),
		});

		this.ProfileAttributes = <FormArray>this.Export.controls['ProfileAttributes'];
		this.ProfilePartFields = <FormArray>this.Export.controls['ProfilePartFields'];

		this.api.get('./export/attributes.json', 'Attributes').subscribe(r => {
			this.type = 'Attributes';
			this.inputs = r['value'];
		});
	}

	ngOnInit(): void {

		this.api.get('./export/account.json', 'profiles').subscribe(r => {
			this.accountType = r['value'];
			this.accountTypeData = r['value'];
		});

		this.api.get('./export/image.json', 'profiles/GetFileTypes').subscribe(r => {
			this.fileType = r['value'];
			this.fileTypeData = r['value'];
		});

		this.api.get('./export/export.json', 'profiles/GetExportFormats').subscribe(r => {
			this.exportType = r['value'];
			this.exportTypeData = r['value'];
		});

		this.api.get('./export/price.json', 'profiles/GetCurrencies').subscribe(r => {
			this.priceType = r['value'];
			this.priceTypeData = r['value'];
		});
	}

	attributeChange(v) {
		this.selectedAttributes = v;
		this.type = v.text;
		if (this.type === 'AX') {
			this.api.get('./export/attributes.json', 'parts/getfields').subscribe(r => {
				this.inputs = r['value'];

				const index = this.inputs.filter((val) => {
					for (let i = 0; i < this.outputs.length; i++) {
						if (val['FieldName'] === this.outputs[i]['FieldName']) {
							return false;
						}
					}
					return true;
				});

				this.inputs = index;
			});
		} else {
			this.api.get('./export/attributes.json', 'Attributes').subscribe(r => {
				this.inputs = r['value'];

				const index = this.inputs.filter((val) => {
					for (let i = 0; i < this.outputs.length; i++) {
						if (val['Name'] === this.outputs[i]['Name']) {
							return false;
						}
					}
					return true;
				});

				this.inputs = index;
			});
		}
	}

	export(status) {
		this.update = false;

		if (status === 'cancel') {
			this.open.emit(false);

			this.Export.reset();
		}

		if (status === 'create-cancel') {
			this.new = false;
			this.default = true;
		}

		if (status === 'confirm') {
			const attr = [];
			const ax = [];

			for (const x of this.outputs) {
				if ('PartFieldID' in x) {
					ax.push({
						'ProfileId': this.Export['ProfileId'], 'FieldName': x['FieldName']
					});
				} else {
					attr.push({ 'ProfileId': this.Export['ProfileId'], 'AttributeID': x['AttributeID'] });
				}
			}

			this.Export.value['ProfileAttributes'] = attr;
			this.Export.value['ProfilePartFields'] = ax;

			if (!this.Export.value.ProfileId) {
				delete this.Export.value.ProfileId;
			}

			const a = { 'profile': this.Export.value };

			this.api.download('profiles/exportparts', a).subscribe(
				(r) => {
					this.alert('success', ' Success - File is downloading now.');
					console.log(r);
					if (r.type === 'text/csv') {
						const blob: Blob = new Blob([r.file], { type: 'text/csv' });
						const fileName: string = 'export.csv';
						const objectUrl: string = URL.createObjectURL(blob);
						const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
						a.href = objectUrl;
						a.download = fileName;
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
					} else {
						window.open(window.URL.createObjectURL(r.file));
					}
				},
				(err) => {
					this.alert('error', err['status'] + ' - ' + err['statusText'])
				}
			);
		}

		if (status === 'save') {
			this.new = true;
			this.default = false;

			if (this.Export.controls['ProfileId'].value) {
				this.update = true;
			}
		}

		if (status === 'create') {
			const attr = [];
			const ax = [];

			for (const x of this.outputs) {
				if ('PartFieldID' in x) {
					ax.push({
						'ProfileId': this.Export['ProfileId'], 'FieldName': x['FieldName']
					});
				} else {
					attr.push({ 'ProfileId': this.Export['ProfileId'], 'AttributeID': x['AttributeID'] });
				}
			}


			this.Export.value['@odata.context'] = 'http://www.phenomenex.com/$metadata#Profiles/$entity';

			this.Export.value['ProfileNameValue'] = this.Save.value.ProfileName;
			this.Export.value['ProfileAttributes'] = attr;
			this.Export.value['ProfilePartFields'] = ax;

			if (this.Export.controls['ProfileId'].value) {
				this.api.put('profiles', this.Export.value).subscribe(
					(r) => {
						if (r) {
							this.new = false;
							this.default = true;
							this.Export.reset();

							this.alert('success', '"' + this.Save.value.ProfileName + '" has been successfully deleted');
						}
					},
					(err) => {
						if (err.status === 409) {
							this.alert('error', err['status'] + ' - ' + 'This is not a unique name.');
						} else {
							this.alert('error', err['status'] + ' - ' + err['statusText'])
						}
					}
				)
			} else {
				delete this.Export.value.ProfileId;

				this.api.post('profiles', this.Export.value).subscribe(
					(r) => {
						if (r) {
							this.new = false;
							this.default = true;
							this.Export.reset();

							this.alert('success', '"' + this.Save.value.ProfileName + '" has been successfully deleted');
						}
					},
					(err) => {
						if (err.status === 409) {
							this.alert('error', err['status'] + ' - ' + 'This is not a unique name.');
						} else {
							this.alert('error', err['status'] + ' - ' + err['statusText'])
						}
					}
				)
			}
		}
	}

	addItems() {
		if (this.addI.length > 1) {
			for (let i = 0; i < this.addI.length; i++) {
				const d = this.addI;

				if ('PartFieldID' in d[i]) {
					d[i]['type'] = 'AX';
					this.outputs.push(d[i]);

					this.outputs.forEach((v) => {
						if (v['type'] === 'AX' && v['PartFieldID']) {
							const a = this.ProfilePartFields.value.find(r => r === v['FieldName']);

							if (!a) {
								this.ProfilePartFields.push(new FormControl(v['FieldName']));
							}
						}
					})

					const index = this.inputs.filter((el) => {
						return el['FieldName'] !== d[i]['FieldName'];
					});

					this.inputs = index;
				} else {
					d[i]['type'] = 'PIM';
					this.outputs.push(d[i]);

					this.outputs.forEach((v) => {
						if (v['type'] === 'PIM' && v['Name']) {
							const a = this.ProfileAttributes.value.find(r => r === v['AttributeID']);

							if (!a) {
								this.ProfileAttributes.push(new FormControl(v['AttributeID']));
							}
						}
					})

					const index = this.inputs.filter((el) => {
						return el['Name'] !== d[i]['Name'];
					});

					this.inputs = index;
				}
			}
		} else {
			const d = this.addI[0];

			if ('PartFieldID' in d) {
				d['type'] = 'AX';

				this.outputs.push(d);

				this.outputs.forEach((v) => {
					if (v['type'] === 'AX' && v['PartFieldID']) {
						const a = this.ProfilePartFields.value.find(r => r === v['FieldName']);

						if (!a) {
							this.ProfilePartFields.push(new FormControl(v['FieldName']));
						}
					}
				})

				const index = this.inputs.filter((el) => {
					return el['FieldName'] !== d['FieldName'];
				});

				this.inputs = index;
			} else {
				d['type'] = 'PIM';

				this.outputs.push(d);

				this.outputs.forEach((v) => {
					if (v['type'] === 'PIM' && v['Name']) {
						const a = this.ProfileAttributes.value.find(r => r === v['AttributeID']);

						if (!a) {
							this.ProfileAttributes.push(new FormControl(v['AttributeID']));
						}
					}
				})

				const index = this.inputs.filter((el) => {
					return el['AttributeID'] !== d['AttributeID'];
				});

				this.inputs = index;
			}
		}

		this.addI = [];
		this.addClicked = [];
		this.addClickedAX = [];
		this.addItemsActive = false;
	}

	private _addItem(i) {
		if (this.addI.indexOf(i) === -1) {
			this.addI.push(i);
		} else {
			this.addI.splice(this.addI.indexOf(i), 1);
		}

		if (this.addI.length !== 0) {
			this.addItemsActive = true;
		} else {
			this.addItemsActive = false;
		}
	}

	removeItems() {
		if (this.removeI.length > 1) {
			for (let i = 0; i < this.removeI.length; i++) {
				const d = this.removeI;

				if ('PartFieldID' in d[i]) {
					this.inputs.push(d[i]);

					const a = this.ProfilePartFields.value.findIndex(r => r === d[i]['FieldName'])
					this.ProfilePartFields.removeAt(a, 1);

					const index = this.outputs.filter(function (el) {
						return el['FieldName'] !== d[i]['FieldName'];
					});

					this.outputs = index;
				} else {
					this.inputs.push(d[i]);

					const a = this.ProfileAttributes.value.findIndex(r => r === d[i]['AttributeID'])
					this.ProfileAttributes.removeAt(a, 1);

					const index = this.outputs.filter((el) => {
						return el['AttributeID'] !== d[i]['AttributeID'];
					});

					this.outputs = index;
				}
			}
		} else {
			const d = this.removeI[0];

			if ('PartFieldID' in d) {
				this.inputs.push(d);

				const a = this.ProfilePartFields.value.findIndex(r => r === d['FieldName'])
				this.ProfilePartFields.removeAt(a, 1);

				const index = this.outputs.filter(function (el) {
					return el['FieldName'] !== d['FieldName'];
				});

				this.outputs = index;

			} else {
				this.inputs.push(d);

				const a = this.ProfileAttributes.value.findIndex(r => r === d['AttributeID'])
				this.ProfileAttributes.removeAt(a, 1);

				const index = this.outputs.filter((el) => {
					return el['AttributeID'] !== d['AttributeID'];
				});

				this.outputs = index;
			}
		}

		this.removeClicked = [];
		this.removeI = [];
		this.removeItemsActive = false;
	}

	private _removeItem(i) {
		if (this.removeI !== []) {
			this.removeItemsActive = true;
			if (this.removeI.indexOf(i) === -1) {
				this.removeI.push(i);
			}
		}
	}

	accountChange(i) {
		const a = i.ProfileID;

		this.api.get('./export/attributes.json', 'profiles(' + a + ')').subscribe(r => {
			this.Export.controls['PriceListKey'].setValue(r['PriceListKey']);
			this.Export.controls['ExportFormatKey'].setValue(r['ExportformatKey']);
			this.Export.controls['FileTypeKey'].setValue(r['FileTypeKey']);
			this.Save.controls['ProfileName'].setValue(r['ProfileNameValue']);

			this.update = true;
		});

		this.api.get('./export/attributes.json', 'profiles(' + a + ')/getselectedattributes').subscribe(r => {
			const b = r['AxAttributes'];
			const c = r['PimAttributes'];
			const d = [];

			this.api.get('./export/attributes.json', 'parts/getfields').subscribe(res => {
				for (const re of res['value']) {
					for (const each of b) {
						if (re.FieldName === each) {
							re.type = 'AX';
							d.push(re);
							this.ProfilePartFields.push(new FormControl(re.PartFieldID));
						}
					}
				};
			});
			this.api.get('./export/attributes.json', 'Attributes').subscribe(res => {
				for (const re of res['value']) {
					for (const each of c) {
						if (re.AttributeID === each) {
							re.type = 'PIM';
							d.push(re);
							this.ProfileAttributes.push(new FormControl(re.Name));
						}
					}
				}

				this.attributeChange(this.selectedAttributes);
			});

			this.outputs = d;
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
}
