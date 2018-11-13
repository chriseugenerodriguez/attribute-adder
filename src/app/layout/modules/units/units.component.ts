import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { API } from '../../../core/services/api.service';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'units',
	templateUrl: './units.component.html'
})
export class UnitsComponent implements OnInit {
	// TOGGLE
	@Output() open = new EventEmitter<boolean>(true);

	stepRow: number;
	inputs = [];
	inputsAttribute = [];

	// MESSAGE
	message: Array<object> = [];

	// GROUP
	Units: FormGroup;
	UnitsAdd: FormGroup;
	stepUnits: any;
	stepUnitsAdd: any;

	groupUnit: boolean;
	groupConfirm: boolean;
	groupView: boolean;
	groupDelete: boolean;
	groupEdit: boolean;
	groupEditStep: number;
	groupEditConfirm: boolean;
	groupCreate: boolean;
	groupSelect: boolean;

	uom = [];
	editStep: any;

	listUnits: string;

	constructor(private api: API, private fb: FormBuilder) {
		this.editStep = null;

		// GROUP
		this.Units = this.fb.group({
			items: this.fb.array([])
		});

		this.UnitsAdd = this.fb.group({
			Value: ['', Validators.required]
		});

		this.stepUnits = <FormArray>this.Units.controls['items'];
	}

	ngOnInit() {
		this.reset();
	}

	private units(status) {

		if (status === 'cancel') {
			this.open.emit(false);

			this.reset();
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
			this.groupSelect = false;
			this.groupCreate = true;
			this.groupView = false;
			this.groupConfirm = true;
			this.groupEditConfirm = false;
			this.groupUnit = false;
		}
		if (status === 'group-confirm') {
			if (this.groupCreate === true) {
				this.api.post('unitsofmeasure', this.UnitsAdd.value).subscribe(
					(r) => {
						if (r) {
							this.alert('success', '"' + this.UnitsAdd.value.Value + '"' + ' has been successfully created');
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

			if (this.groupEditConfirm === true) {
				const a = this.Units.controls['items'].value[this.editStep];

				this.api.put('unitsofmeasure(' + this.groupEditStep + ')', a).subscribe(
					(r) => {
						this.alert('success', '"' + a.Value + '"' + ' has been successfully updated');
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
		}
		if (status === 'group-cancel') {
			this.reset();
		}
	}

	reset() {
		this.listUnits = ''

		this.groupUnit = true;
		this.groupEdit = false;
		this.groupConfirm = false;
		this.groupDelete = false;
		this.groupCreate = false;
		this.groupView = true;
		this.groupSelect = true;
		this.editStep = null;

		this.UnitsAdd.reset();
		this.stepUnits.controls.splice(0);

		this.api.get('./uom/list.json', 'unitsofmeasure').subscribe(r => {
			this.inputs = r['value'];
			this.inputsAttribute = r['value'];

			for (const x of this.inputs) {
				this.stepUnits.push(this.createGroupUnit(
					x.Key,
					x.Value
				));
			}
		});
	}

	private resetSearch() {
		// this.stepUnits.controls = [];

		for (const x of this.inputsAttribute) {
			this.stepUnits.push(this.createGroupUnit(
				x.key,
				x.value
			));
		}
	}

	filterUnits(obj) {
		const a = obj.target.value;

		this.inputsAttribute = this.inputs.filter((s) => s.Value.toLowerCase().indexOf(a.toLowerCase()) !== -1);

		this.resetSearch();
	}

	createGroupUnit(key?: number, value?: string) {
		return this.fb.group({
			Key: [key],
			Value: [value, Validators.required],
		})
	}

	removeGroupStep(idx, i) {
		const a = idx.Key;

		if (this.groupDelete === true) {
			this.api.delete('unitsofmeasure(' + a + ')').subscribe(
				(r) => {
					if (r) {
						this.stepUnits.removeAt(i);
						this.groupDelete = false;
						this.groupEdit = false;

						this.alert('success', idx.Value + ' has been successfully deleted');
					}
				},
				(err) => {
					this.alert('error', err['status'] + ' - ' + err['statusText']);
				}
			)
		}
	}

	editGroupStep(v, i) {
		this.editStep = i;
		this.groupEditStep = v;
		this.groupEdit = false;
		this.groupEditConfirm = true;
		this.groupConfirm = true;
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
