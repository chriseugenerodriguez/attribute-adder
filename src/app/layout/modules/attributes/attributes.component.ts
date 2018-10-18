import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { API } from '../../../core';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { FileRestrictions, SuccessEvent, UploadEvent, FileInfo } from '@progress/kendo-angular-upload';

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
	stepRow: number;
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

	// File UPLOAD
	uploadFile: Array<FileInfo> = [];
	uploadUrl: string = 'https://phx-appmanager-api-dev.azurewebsites.net/phenomenex/appManager/1.0.0/applications/';
	uploadRemoveUrl: string = '';

	constructor(private api: API, private fb: FormBuilder) {
		this.stepRow = 0;
		this.editStep = null;

		this.reset();

		// FORM GROUPS
		this.Create = this.fb.group({
			Name: ['', Validators.required],
			Multiselect: [''],
			Type: ['', Validators.required],
			File: [''],
			Unit: ['']
		});

		this.Add = this.fb.group({
			Key: ['']
		});

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
	}

	ngOnInit(): void {
		this.api.get('./uom/list.json', 'image').subscribe(r => {
			this.unit = r;
		});

		this.api.get('./attributes/attribute-type.json', 'image').subscribe(r => {
			this.type = r;
		});

		this.api.get('./export/attributes.json', 'image').subscribe(r => {
			this.inputs = r;
			this.inputsAttributes = r;

			for (const x of r) {
				this.stepAttributes.push(this.createGroupAttribute(
					x.key,
					x.value,
					x.multiselect,
					x.type,
					x.file,
					x.unit
				));
			}
		});
	}

	private resetSearch() {
		this.stepAttributes.controls = [];

		for (const x of this.inputsAttributes) {
			this.stepAttributes.push(this.createGroupAttribute(
				x.key,
				x.value,
				x.multiselect,
				x.type,
				x.file,
				x.unit
			));
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

		// SINGLE
		this.singleView = false;
		this.singleSelect = false;
		this.singleDelete = false;
		this.singleEdit = false;
		this.singleAdd = false;
	}

	// Manage different view
	manage(status) {
		this.confirm = false;
		this.resetSearch();

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
			this.editStep = null;
			this.singleAdd = false;
			this.singleEdit = false;
			this.singleSelect = false;
			this.singleView = false;
			this.singleAttribute = false;

			this.groupAttribute = true;
			this.groupView = true;
			this.groupSelect = false;
		}

		if (status === 'single-cancel') {
			this.groupAttribute = false;

			this.singleAttribute = false;
			this.singleSelect = false;
			this.singleEdit = false;
			this.singleView = false;
			this.singleDelete = false;
			this.singleAdd = false;
			this.editStep = null;

			this.Add.reset();
			this.stepAttribute.reset();

			this.manageSingleUnit(this.singleSelectedValue);

		}
		if (status === 'single-confirm') {
			if (this.singleAttribute) {
				this.api.put('attributes', this.Attribute.value).subscribe(
					(r) => {
						if (r) {
							this.editStep = null;

							this.alert('success', r['statusText'])
						}
					},
					(err) => {
						this.alert('error', err['status'] + ' - ' + err['statusText'])
					}
				)
			}

			if (this.singleAdd) {
				this.api.post('attributes', this.Add.value).subscribe(
					(r) => {
						if (r) {
							this.alert('success', r['statusText'])
						}
					},
					(err) => {
						this.alert('error', err['status'] + ' - ' + err['statusText'])
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
				this.api.post('attributes', this.Attributes.value).subscribe(
					(r) => {
						if (r) {
							this.alert('success', r['statusText'])
						}
					},
					(err) => {
						this.alert('error', err['status'] + ' - ' + err['statusText'])
					}
				)
			}
			if (this.groupCreate) {
				this.api.put('attributes', this.Create.value).subscribe(
					(r) => {
						if (r) {
							this.alert('success', r['statusText'])
						}
					},
					(err) => {
						this.alert('error', err['status'] + ' - ' + err['statusText'])
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
	createSingleAttribute(step?: number, name?: string, details?: string, number?: number, url?: string, extension?: string) {
		console.log(extension);
		if (step !== null) {
			this.stepRow = step;
		} else {
			this.stepRow = this.stepRow + 1;
		}

		return this.fb.group({
			Step: [this.stepRow],
			Name: [name],
			Details: [details],
			Number: [number],
			Url: [url],
			Ext: [extension]
		})
	}

	createGroupAttribute(step?: number, name?: string, multiselect?: boolean, type?: string, file?: boolean, unit?: string) {
		if (step !== null) {
			this.stepRow = step;
		} else {
			this.stepRow = this.stepRow + 1;
		}

		return this.fb.group({
			Step: [this.stepRow],
			Name: [name],
			Multiselect: [multiselect],
			Type: [type],
			File: [file],
			Unit: [unit]
		})
	}

	removeGroupStep(idx: number) {
		if (this.groupDelete === true) {

			this.api.delete('attributes', idx).subscribe(
				(r) => {
					if (r) {
						this.stepAttributes.removeAt(idx);
						this.groupDelete = false;
						this.groupEdit = false;

						this.alert('success', r['statusText'])
					}
				},
				(err) => {
					this.alert('error', err['status'] + ' - ' + err['statusText'])
				}
			)
		}
	}

	removeSingleStep(idx: number) {
		if (this.singleDelete === true) {

			this.api.put('attributes', idx).subscribe(
				(r) => {
					if (r) {
						this.stepAttribute.removeAt(idx);

						this.alert('success', r['statusText'])
					}
				},
				(err) => {

					this.alert('error', err['status'] + ' - ' + err['statusText'])
				}
			)
		}
	}

	typeChange(val) {
		this.attributeFile = val === 2 ? true : false;
		this.attributeUnit = val === 1 ? true : false;
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
		if (this.singleSelectedValue['Type'] === 'number') {
			this.attributeString = false;
		} else {
			this.attributeString = true;
		}

		console.log(this.singleSelectedValue, this.attributeString);

		if (!this.attributeString) {
			if (!this.Add.value['Number']) {
				this.Add.addControl('Number', new FormControl('', Validators.required));
			}
			this.Add.removeControl('File');
			this.Add.removeControl('Name');
			this.Add.removeControl('Details');
		} else {
			if (!this.singleSelectedValue['File']) {
				if (!this.Add.value['Name'] && !this.Add.value['Details']) {
					this.Add.addControl('Name', new FormControl('', Validators.required));
					this.Add.addControl('Details', new FormControl('', Validators.required));
				}
				this.Add.removeControl('File');
				this.Add.removeControl('Number');
			} else {
				if (!this.Add.value['File']) {
					this.Add.addControl('File', new FormControl('', Validators.required));
				}
				this.Add.removeControl('Name');
				this.Add.removeControl('Number');
				this.Add.removeControl('Details');
			}
		}

		if (!this.singleSelectedValue['File']) {
			this.api.get('./attributes/data.json', 'attributes/' + attr.key).subscribe(r => {
				this.attributeFeatures = r;

				for (const x of r) {
					this.stepAttribute.push(this.createSingleAttribute(
						x.step,
						x.name,
						x.details,
						x.number
					));
				}
			});
		} else {
			this.api.get('./attributes/data-file.json', 'attributes').subscribe(r => {
				this.attributeFeatures = r;
				console.log(r);
				for (const x of r) {
					console.log(x.extension);
					this.stepAttribute.push(this.createSingleAttribute(
						x.step,
						x.name,
						x.uid,
						x.url,
						x.extension
					));
				}
			});
		}
	}


	// TODO: write function to remove file
	public removeUploadFile(file) {
		console.log('remove ' + file);
	}

	// Response from a success upload
	public uploadSuccess(e: SuccessEvent) {
		let r = e.response;
		this.uploadFile = r['body'];
	}

	public uploadEvent(e: UploadEvent) {
		// e.headers = e.headers.append('Authorization', 'Bearer ' + this.AS.getToken());
	}

	editGroupStep(i) {
		this.editStep = i;
		this.singleSelect = false;

		this.groupView = false;
		this.groupEdit = false;
		this.groupSelect = true;
		this.groupEditConfirm = true;
	}

	editSingleStep(i) {
		this.editStep = i;
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
