import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { API } from '../../../core';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { FileRestrictions, SuccessEvent, UploadEvent, FileInfo, FileState } from '@progress/kendo-angular-upload';

import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'attributes',
	templateUrl: './attributes.component.html'
})
export class AttributesComponent implements OnInit {
	// TOGGLE
	@Output() open = new EventEmitter<boolean>(true);

	// MESSAGE
	message: Array<object> = [];

	// MANAGE
	inputs = [];
	inputsAttributes = [];
	items: any[] = [];
	confirm: boolean;
	type: Array<{ key: number, value: string }>;
	unit: Array<{ key: number, value: string }>;

	// FILTER
	listUnits: string;

	// SINGLE
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

	// GROUP
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

	// File UPLOAD
	uploadFiles: Array<FileInfo> = [];
	uploadUrl: string = this.api.apibase;
	uploadRemoveUrl: string = '';

	constructor(private api: API, private fb: FormBuilder) {
		this.editStep = null;

		// FORM GROUPS
		this.Create = this.fb.group({
			Name: [null, Validators.required],
			Multiselect: [false],
			TypeKey: [null, Validators.required],
			UOMKey: [null]
		});

		// ADD CHILD
		this.Add = this.fb.group({});

		// FORM GROUPS - ARRAY
		this.Attributes = this.fb.group({
			items: this.fb.array([])
		});

		// FORM GROUPS - ARRAY (STRING)
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
		// MANAGE
		this.groupAttribute = true;
		this.groupView = true;
		this.groupDelete = false;
		this.groupEdit = false;
		this.groupSelect = false;
		this.groupCreate = false;

		this.editStep = null;

		// SINGLE
		this.singleAttribute = false;
		this.singleView = false;
		this.singleSelect = false;
		this.singleDelete = false;
		this.singleEdit = false;
		this.singleAdd = false;

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

	// Manage different view
	manage(status) {
		this.confirm = false;

		if (status === 'close') {
			this.open.emit(false);

			this.reset();

			this.stepAttributes = [];
			this.stepAttribute = [];
		}

		// SINGLE
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
			}
		}

		// GROUP
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
				let a = this.Create.value;

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

	// MANAGE
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
			Ext: [Extension],
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
					this.alert('error', err['status'] + ' - ' + err['statusText']);
				}
			)
		}
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

		// TYPES
		if (this.singleSelectedValue['TypeKey'] === 'String') {
			this.attributeString = true;
		}
		if (this.singleSelectedValue['TypeKey'] !== 'String') {
			this.attributeString = false;
		}

		if (!this.attributeString) {
			if (!this.Add.value['NumericValue']) {
				this.Add.addControl('NumericValue', new FormControl('', Validators.required));
			}
			this.Add.removeControl('File');
			this.Add.removeControl('StringValue');
			this.Add.removeControl('StringDetail');
		}
		if (this.singleSelectedValue['TypeKey'] !== 'File') {
			if (!this.Add.value['StringValue'] && !this.Add.value['StringDetail']) {
				this.Add.addControl('StringValue', new FormControl('', Validators.required));
				this.Add.addControl('StringDetail', new FormControl('', Validators.required));
			}
			this.Add.removeControl('File');
			this.Add.removeControl('NumericValue');
		} else {
			console.log(this.singleSelectedValue);
			this.uploadUrl = this.uploadUrl + 'attributevalues(' + this.singleSelectedValue['AttributeID'] + ')/uploadfile';
			if (!this.Add.value['File']) {
				this.Add.addControl('File', new FormControl('', Validators.required));
			}
			this.Add.removeControl('StringValue');
			this.Add.removeControl('NumericValue');
			this.Add.removeControl('StringDetail');
		}
		// tslint:disable-next-line:max-line-length
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
						x.ImageValue,
						x.Source,
						x.extension
					));
				}
			}
		});
	}


	public uploadEvent(e: UploadEvent) {
		const l = e.files[0];
		e.headers = e.headers.append('x-fileid', l['uid']);
		e.headers = e.headers.append('x-fileid-size', JSON.stringify(l['size']));
		// e.headers = e.headers.append('Authorization', 'Bearer ' + this.AS.getToken());

		const up = {
			extension: l['extension'],
			name: l['rawFile'].name,
			size: l['size'],
			uid: l['uid'],
			url: 'https://phenomenexdev.blob.core.windows.net/attributevaluefiles/' + l['uid'] + l['extension']
		};
		this.uploadFiles.push(up);

		this.Add.setValue(this.uploadFiles);
	}

	public removeUploadFile(upload, uid: string) {
		for (const x of this.uploadFiles) {
			if (x.uid === uid) {
				this.uploadFiles.splice(this.uploadFiles.indexOf(x), 1);
				break;
			}
		}

		this.Add.setValue(this.uploadFiles);
		this.Add.markAsDirty();
	}

	public format(state: FileState): boolean {
		return (state === FileState.Uploaded || state === 1) ? true : false;
	}

	public download(b) {
		window.open('https://phenomenexdev.blob.core.windows.net/attributevaluefiles/' + b['uid'] + b['extension'], '_blank');
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
