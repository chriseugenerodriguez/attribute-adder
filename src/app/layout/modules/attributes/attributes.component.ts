import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { API } from '../../../core';
import 'rxjs/add/operator/map';

import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert';

// RESPONSE
import { Http } from '@angular/http';

@Component({
	selector: 'attributes',
	templateUrl: './attributes.component.html'
})
export class AttributesComponent implements OnInit {

	@Output() open = new EventEmitter<boolean>(true);


	message: Array<object> = [];


	inputs = [];
	inputsAttributes = [];
	items: any[] = [];
	confirm: boolean;
	type: Array<{ key: number, value: string }>;
	unit: Array<{ key: number, value: string }>;


	listUnits: string;


	Attribute: FormGroup;
	Add: FormGroup;
	stepAttribute: any;
	stepAttributeAdd: any;
	newAttribute: Array<object> = [];

	singleAttribute: boolean;
	singleView: boolean;
	singleSelect: boolean;
	singleDelete: boolean;
	singleEdit: boolean;
	singleAdd: boolean;
	singleSelectedValue: string;
	singleEditConfirm: boolean;
	editStep: any;


	Attributes: FormGroup;
	Create: FormGroup;
	stepAttributes: any;

	attributeUnit: boolean = false;
	attributeFile: boolean = false;
	attributeString: boolean;

	attributeFeatures: Array<any>;

	groupAttribute: boolean;
	groupSelect: boolean;
	groupView: boolean;
	groupDelete: boolean;
	groupEdit: boolean;
	groupCreate: boolean;
	groupEditConfirm: boolean;
	groupEditStep: number;

	// FILE
	files: any;

	constructor(private api: API, private fb: FormBuilder, private http: Http) {
		this.editStep = null;

		this.Create = this.fb.group({
			Name: [null, Validators.required],
			Multiselect: [false],
			TypeKey: [null, Validators.required],
			UOMKey: [null]
		});

		this.Add = this.fb.group({});

		this.Attributes = this.fb.group({
			items: this.fb.array([])
		});

		this.Attribute = this.fb.group({
			items: this.fb.array([])
		});

		this.stepAttribute = <FormArray>this.Attribute.controls['items'];
		this.stepAttributes = <FormArray>this.Attributes.controls['items'];

		this.reset();
	}

	ngOnInit(): void {
		this.api.get('./uom/list.json', 'unitsofmeasure').subscribe(r => {
			this.unit = r['value'];
		});

		this.api.get('./uom/type.json', 'attributevalues/gettypes').subscribe(r => {
			this.type = r['value']
		})
	}

	private resetSearch() {
		this.stepAttributes.controls = [];

		for (const x of this.inputsAttributes) {
			if (x.UOMKey != null) {
				this.stepAttributes.push(this.createGroupAttribute(
					x.AttributeID,
					x.Name,
					x.Multiselect,
					x.AttributeType.Value,
					x.UnitOfMeasure.Value
				));
			} else {
				this.stepAttributes.push(this.createGroupAttribute(
					x.AttributeID,
					x.Name,
					x.Multiselect,
					x.AttributeType.Value
				));
			}
		}
	}

	reset() {
		const group = 'group';
		const single = 'single';

		this.groupAttribute = true;
		this.groupView = true;

		this.editStep = null;

		const a = ['Delete', 'Edit', 'Select', 'Create'];
		for (let i = 0; i < a.length; i++) {
			this[group + a[i]] = false;
		}

		const b = ['Attribute', 'View', 'Select', 'Delete', 'Edit', 'Add'];
		for (let i = 0; i < b.length; i++) {
			this[single + b[i]] = false;
		}

		this.stepAttributes.controls.splice(0);

		this.api.get('./export/attributes.json', 'Attributes?$expand=AttributeType,UnitOfMeasure').subscribe(r => {
			this.inputs = r['value'];
			this.inputsAttributes = r['value'];

			for (const x of r['value']) {
				if (x.UOMKey != null) {
					this.stepAttributes.push(this.createGroupAttribute(
						x.AttributeID,
						x.Name,
						x.Multiselect,
						x.AttributeType.Value,
						x.UnitOfMeasure.Value
					));
				} else {
					this.stepAttributes.push(this.createGroupAttribute(
						x.AttributeID,
						x.Name,
						x.Multiselect,
						x.AttributeType.Value
					));
				}
			}
		});
	}


	manage(status) {
		this.confirm = false;

		if (status === 'close') {
			this.open.emit(false);

			this.reset();

			this.stepAttributes = [];
			this.stepAttribute = [];
		}

		if (status === 'single-add') {
			this.singleSelect = true;
			this.singleEdit = false;
			this.singleView = false;
			this.singleAdd = true;
			this.singleAttribute = false;
			this.singleEditConfirm = false;
		}

		if (status === 'single-delete') {
			this.singleEdit = false;
			this.singleDelete = !this.singleDelete;
		}
		if (status === 'single-edit') {
			this.singleDelete = false;
			this.singleEdit = !this.singleEdit;
		}
		if (status === 'single-back') {
			this.reset();
		}

		if (status === 'single-cancel') {
			this.reset();
			this.manageSingleUnit(this.singleSelectedValue);

		}
		if (status === 'single-confirm') {
			if (this.singleAttribute) {
				const a = this.Attribute.controls['items'].value[this.editStep];
				const b = a.AttributeID;

				if (this.singleSelectedValue['TypeKey'] === 'String') {
					a['@odata.type'] = '#Phx.ProductManager.Data.Entities.AttributeValueString';
				}
				if (this.singleSelectedValue['TypeKey'] === 'Numeric') {
					a['@odata.type'] = '#Phx.ProductManager.Data.Entities.AttributeValueNumeric';
				}
				if (this.singleSelectedValue['TypeKey'] === 'File') {
					a['@odata.type'] = '#Phx.ProductManager.Data.Entities.AttributeValueFile';
				}

				if (this.singleSelectedValue['TypeKey'] !== 'File') {
					delete a.AttributeValueID;
					delete a.AttributeID;

					this.api.patch('attributevalues(' + b + ')', a).subscribe(
						(r) => {
							this.alert('success', '"' + a.Name + '"' + ' has been successfully updated');
							this.reset();
						},
						(err) => {
							this.reset();

							if (err.status === 409) {
								this.alert('error', err['status'] + ' - ' + 'This is not a unique value.');
							} else {
								this.alert('error', err['status'] + ' - ' + err['statusText'])
							}
						}
					)
				} else {
					const c = this.files;
					c.append('attributeValueId', a.AttributeID);

					this.http.post(this.api.apibase + 'attributevalues(' + a.AttributeValueID + ')/uploadfile', c).subscribe(
						(r) => {
							if (r) {
								this.alert('success', 'This has been successfully uploaded');
								this.reset();
							}
						},
						(err) => {
							if (err.status === 409) {

								this.alert('error', err['status'] + ' - ' + 'This is not a unique value.');
							} else {
								this.alert('error', err['status'] + ' - ' + err['statusText'])
							}
						}
					)
				}
			}

			if (this.singleAdd) {
				const a = this.Add.value;
				a.AttributeID = this.singleSelectedValue['AttributeID'];

				if (this.singleSelectedValue['TypeKey'] === 'String') {
					a['@odata.type'] = '#Phx.ProductManager.Data.Entities.AttributeValueString';
				}
				if (this.singleSelectedValue['TypeKey'] === 'Numeric') {
					a['@odata.type'] = '#Phx.ProductManager.Data.Entities.AttributeValueNumeric';
				}
				if (this.singleSelectedValue['TypeKey'] === 'File') {
					a['@odata.type'] = '#Phx.ProductManager.Data.Entities.AttributeValueFile';
				}

				if (this.singleSelectedValue['TypeKey'] !== 'File') {
					this.api.post('attributevalues', a).subscribe(
						(r) => {
							if (r) {
								this.alert('success', '"' + this.singleSelectedValue['Name'] + '"' + ' has been successfully created');
								this.reset();
							}
						},
						(err) => {
							if (err.status === 409) {

								this.alert('error', err['status'] + ' - ' + 'This is not a unique value.');
							} else {
								this.alert('error', err['status'] + ' - ' + err['statusText'])
							}
						}
					)
				} else {
					const b = a.AttributeID;
					const c = this.files;

					this.http.post(this.api.apibase + 'attributevalues(' + b + ')/uploadfile', c).subscribe(
						(r) => {
							if (r) {
								this.alert('success', 'This has been successfully uploaded');
								this.reset();
							}
						},
						(err) => {
							if (err.status === 409) {

								this.alert('error', err['status'] + ' - ' + 'This is not a unique value.');
							} else {
								this.alert('error', err['status'] + ' - ' + err['statusText'])
							}
						}
					)
				}
			}
		}

		if (status === 'group-delete') {
			this.groupDelete = !this.groupDelete;
			this.groupEdit = false;
		}
		if (status === 'group-edit') {
			this.groupDelete = false;
			this.groupEdit = !this.groupEdit;
		}
		if (status === 'group-create') {
			this.singleAdd = false;
			this.singleAttribute = false;

			this.groupEditConfirm = false;
			this.groupCreate = true;
			this.groupView = false;
			this.groupSelect = true;

			this.groupAttribute = false;
		}
		if (status === 'group-confirm') {
			if (this.groupEditConfirm) {
				const a = Object.create(this.Attributes.controls['items'].value[this.editStep]);

				for (const i of this.unit) {
					if (i['Value'] === a.UOMKey) {
						a.UOMKey = i['Key']
					}
				}

				for (const i of this.type) {
					if (i['Value'] === a.TypeKey) {
						a.TypeKey = i['Key'];
					}
				}

				this.api.patch('attributes(' + this.groupEditStep + ')', a).subscribe(
					(r) => {
						this.alert('success', '"' + a.Name + '"' + ' has been successfully updated');
						this.reset();
					},
					(err) => {
						this.reset();

						if (err.status === 409) {
							const b = JSON.parse(err._body);

							this.alert('error', err['status'] + ' - ' + 'This is not a unique value.');
						} else {
							this.alert('error', err['status'] + ' - ' + err['statusText'])
						}
					}
				)
			}
			if (this.groupCreate) {
				const a = this.Create.value;

				a['@odata.type'] = '#Phx.ProductManager.Data.Entities.Attribute';

				this.api.post('attributes', a).subscribe(
					(r) => {
						if (r) {
							this.alert('success', '"' + this.Create.value.Name + '"' + ' has been successfully created');
							this.reset();
						}
					},
					(err) => {
						if (err.status === 409) {
							this.alert('error', err['status'] + ' - ' + 'This is not a unique value.');
						} else {
							this.alert('error', err['status'] + ' - ' + err['statusText'])
						}
					}
				)
			}
		}

		if (status === 'group-cancel') {
			this.listUnits = '';

			this.groupAttribute = true;
			this.groupDelete = false;
			this.groupCreate = false;
			this.groupView = true;
			this.groupSelect = false;
			this.editStep = null;

			this.inputsAttributes = this.inputs;

			this.Create.reset();
			this.stepAttributes.controls.splice(0);

			this.resetSearch();
		}
	}

	filterAttribute(obj) {
		const a = obj.target.value;
		this.inputsAttributes = this.inputs.filter((s) => s.value.toLowerCase().indexOf(a.toLowerCase()) !== -1);
		this.resetSearch();
	}

	formData(file) {
		this.files = new FormData();
		this.files.append(file.name, file);
	}


	createSingleStringAttribute(AttributeValueID?: number, AttributeID?: number, StringValue?: string, StringDetail?: string) {
		return this.fb.group({
			AttributeValueID: [AttributeValueID],
			AttributeID: [AttributeID],
			StringValue: [StringValue],
			StringDetail: [StringDetail],
		})
	}

	createSingleNumericAttribute(AttributeValueID?: number, AttributeID?: number, NumericValue?: string, Detail?: string) {
		return this.fb.group({
			AttributeValueID: [AttributeValueID],
			AttributeID: [AttributeID],
			NumericValue: [NumericValue],
			Detail: [Detail],
		})
	}

	createSingleFileAttribute(AttributeValueID?: number, AttributeID?: number, FileValue?: string, Source?: string, Extension?: string) {
		return this.fb.group({
			AttributeValueID: [AttributeValueID],
			AttributeID: [AttributeID],
			FileValue: [FileValue],
			Source: [Source],
			Extension: [Extension],
		})
	}

	createGroupAttribute(id?: number, name?: string, multiselect?: boolean, type?: string, unit?: string) {
		return this.fb.group({
			AttributeID: [id],
			Name: [name],
			Multiselect: [multiselect],
			TypeKey: [type],
			UOMKey: [unit]
		})
	}

	removeGroupStep(idx, i) {
		const a = idx.AttributeID;

		if (this.groupDelete === true) {
			this.api.delete('attributes(' + a + ')').subscribe(
				(r) => {
					this.stepAttributes.removeAt(i);
					this.groupDelete = false;
					this.groupEdit = false;

					this.alert('success', '"' + idx.Name + '" has been successfully deleted');
				},
				(err) => {
					const b = {idx, i};

					if (err.status === 406) {
						// tslint:disable-next-line:max-line-length
						this.alert('error', err['status'] + ' - ' + 'This has associations to part. Confirm by clicking <a (click)="confirmGroupDelete(' + b + ')">here</a>');
					} else {
						this.alert('error', err['status'] + ' - ' + err['statusText'])
					}
				}
			)
		}
	}

	confirmGroupDelete(val) {
		const a = val.idx.AttributeID;

		this.api.delete('attributes(' + a + ')&force=true').subscribe(
			(r) => {
				this.stepAttributes.removeAt(val.i);
				this.groupDelete = false;
				this.groupEdit = false;

				this.alert('success', '"' + val.idx.Name + '" has been successfully deleted');
			}
		);
	}

	removeSingleStep(idx, i) {
		const a = idx.AttributeValueID;

		if (this.singleDelete === true) {
			this.api.delete('attributevalues(' + a + ')').subscribe(
				(r) => {
					this.stepAttribute.removeAt(i);
					this.singleDelete = false;
					this.singleEdit = false;

					if (this.singleSelectedValue['TypeKey'] === 'String') {
						this.alert('success', '"' + idx.StringDetail + '" has been successfully deleted');
					}
					if (this.singleSelectedValue['TypeKey'] === 'Numeric') {
						this.alert('success', '"' + idx.NumericValue + '" has been successfully deleted');
					}
					if (this.singleSelectedValue['TypeKey'] === 'File') {
						this.alert('success', '"' + idx.FileValue + '" has been successfully deleted');
					}
				},
				(err) => {
					this.alert('error', err['status'] + ' - ' + err['statusText']);
				}
			)
		}
	}

	typeChange(val) {
		this.attributeFile = val === 1 ? true : false;
		this.attributeUnit = val === 2 ? true : false;
	}

	manageSingleUnit(attr) {
		const a = attr;
		if (a.asyncValidator !== undefined) {
			this.singleSelectedValue = a.value;
		} else {
			this.singleSelectedValue = a;
		}

		this.groupAttribute = false;
		this.groupView = false;
		this.groupEdit = false;

		this.singleAttribute = true;
		this.singleView = true;
		this.singleEdit = false;

		this.stepAttribute.controls.splice(0);

		if (this.singleSelectedValue['TypeKey'] === 'String') {
			this.attributeString = true;
		}
		if (this.singleSelectedValue['TypeKey'] !== 'String') {
			this.attributeString = false;
		}

		if (this.singleSelectedValue['TypeKey'] === 'Numeric') {
			if (!this.Add.value['NumericValue']) {
				this.Add.addControl('NumericValue', new FormControl('', Validators.required));
			}
			this.Add.removeControl('File');
			this.Add.removeControl('StringValue');
			this.Add.removeControl('StringDetail');
		}
		if (this.singleSelectedValue['TypeKey'] === 'String') {
			if (!this.Add.value['StringValue'] && !this.Add.value['StringDetail']) {
				this.Add.addControl('StringValue', new FormControl('', Validators.required));
				this.Add.addControl('StringDetail', new FormControl('', Validators.required));
			}
			this.Add.removeControl('File');
			this.Add.removeControl('NumericValue');
		}
		if (this.singleSelectedValue['TypeKey'] === 'File') {
			if (!this.Add.value['File']) {
				this.Add.addControl('File', new FormControl('', Validators.required));
			}
			this.Add.removeControl('StringValue');
			this.Add.removeControl('NumericValue');
			this.Add.removeControl('StringDetail');
		}

		this.api.get('./attributes/data-file.json', 'Attributes(' + this.singleSelectedValue['AttributeID'] + ')/getAttributeValues').subscribe(r => {
			if (this.singleSelectedValue['TypeKey'] === 'String') {
				for (const x of r['value']) {
					this.stepAttribute.push(this.createSingleStringAttribute(
						x.AttributeID,
						x.AttributeValueID,
						x.StringValue,
						x.StringDetail
					));
				}
			}
			if (this.singleSelectedValue['TypeKey'] === 'Numeric') {
				for (const x of r['value']) {
					this.stepAttribute.push(this.createSingleNumericAttribute(
						x.AttributeID,
						x.AttributeValueID,
						x.NumericValue,
						x.Detail
					));
				}
			}
			if (this.singleSelectedValue['TypeKey'] === 'File') {
				for (const x of r['value']) {
					this.stepAttribute.push(this.createSingleFileAttribute(
						x.AttributeID,
						x.AttributeValueID,
						x.FileValue,
						x.Source,
						x.Extension
					));
				}
			}
		});
	}

	editGroupStep(v, i) {
		this.editStep = i;
		this.groupEditStep = v;
		this.singleSelect = false;

		this.groupView = false;
		this.groupEdit = false;
		this.groupSelect = true;
		this.groupEditConfirm = true;
	}

	editSingleStep(v, i) {
		this.editStep = i;
		this.groupEditStep = v;

		this.singleView = false;
		this.singleSelect = true;
		this.singleEdit = false;
		this.singleAdd = false;
		this.singleEditConfirm = true;

		this.groupView = false;
		this.groupEdit = false;
		this.groupSelect = false;
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
