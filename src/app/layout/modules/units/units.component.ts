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
	groupEditConfirm: boolean;
	groupCreate: boolean;
	groupSelect: boolean;

	// SINGLE
	Unit: FormGroup;
	UnitAdd: FormGroup;
	stepUnit: any;
	stepUnitAdd: any;

	uom = [];
	editStep: any;
	selectedUnit: string;
	singleView: boolean;
	singleDelete: boolean;
	singleEdit: boolean;
	singleEditConfirm: boolean;
	singleConfirm: boolean;
	singleCreate: boolean;
	singleSelect: boolean;

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

		// SINGLE
		this.Unit = this.fb.group({
			items: this.fb.array([])
		});

		this.stepUnit = <FormArray>this.Unit.controls['items'];

		this.UnitAdd = this.fb.group({
			Value: ['', Validators.required]
		});

	}

	ngOnInit() {
		this.reset();

		this.api.get('./uom/list.json', 'image').subscribe(r => {
			this.inputs = r;
			this.inputsAttribute = r;


			for (const x of r) {
				this.stepUnits.push(this.createGroupUnit(
					x.key,
					x.value
				));
			}
		});
	}

	private units(status) {
		this.resetSearch();

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
				this.api.post('attributes', this.Units.value).subscribe(
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

			if (this.groupEditConfirm === true) {
				this.api.put('attributes', this.Units.value).subscribe(
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

			this.api.get('./uom/list.json', 'attributes').subscribe(r => {
				for (const x of r) {
					this.stepUnits.push(this.createGroupUnit(
						x.key,
						x.value
					));
				}
			});
		}
		if (status === 'single-cancel') {
			if (this.singleConfirm) {
				this.singleCreate = false;
				this.singleConfirm = false;
				this.singleEditConfirm = false;

				this.singleSelect = true;
				this.singleView = true;
				this.editStep = null;

				this.UnitAdd.reset();
				this.stepUnit.controls.splice(0);

				this.api.get('./uom/single.json', 'attributes').subscribe(r => {
					for (const x of r) {
						this.stepUnit.push(this.createGroupUnit(
							x.key,
							x.value
						));
					}
				});
			}
		}

		if (status === 'single-add') {
			this.groupSelect = false;

			this.singleCreate = true;
			this.singleConfirm = true;
			this.singleEditConfirm = false;

			this.singleSelect = false;
			this.singleView = false;
		}

		if (status === 'single-edit') {
			this.singleDelete = false;
			this.singleEdit = !this.singleEdit;
		}

		if (status === 'single-delete') {
			this.singleEdit = false;
			this.singleDelete = !this.singleDelete;
		}

		if (status === 'single-back') {
			this.singleCreate = false;
			this.singleConfirm = false;
			this.singleEditConfirm = false;
			this.singleSelect = false;
			this.singleView = false;
			this.singleEdit = false;

			this.groupView = true;
			this.groupSelect = true;
		}

		if (status === 'single-confirm') {
			if (this.singleEditConfirm) {
				this.api.put('attributes', this.Unit.value).subscribe(
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

			if (this.singleCreate) {
				this.api.post('attributes', this.UnitAdd.value).subscribe(
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

	}

	reset() {
		// MANAGE
		this.groupUnit = true;
		this.groupView = true;
		this.groupSelect = true;
		this.groupDelete = false;
		this.groupEdit = false;
		this.groupEditConfirm = false;
		this.groupConfirm = false;
		this.groupCreate = false;

		this.singleView = false;
		this.singleConfirm = false;
		this.singleEdit = false;
		this.singleEditConfirm = false;
		this.singleDelete = false;
		this.singleCreate = false;
		this.singleSelect = false;
		this.editStep = null;
	}

	private resetSearch() {
		this.stepUnits.controls = [];

		for (const x of this.inputsAttribute) {
			this.stepUnits.push(this.createGroupUnit(
				x.key,
				x.value
			));
		}
	}

	filterUnits(obj) {
		const a = obj.target.value;

		this.inputsAttribute = this.inputs.filter((s) => s.value.toLowerCase().indexOf(a.toLowerCase()) !== -1);

		this.resetSearch();
	}

	createGroupUnit(key?: number, value?: string) {

		return this.fb.group({
			Key: [key],
			Value: [value, Validators.required],
		})
	}

	manageSingleUnit(v) {
		this.selectedUnit = v.value.Value;

		this.groupConfirm = false;
		this.groupSelect = false;
		this.groupView = false;

		this.singleView = true;
		this.singleSelect = true;

		this.stepUnit.controls = [];

		this.api.get('./uom/single.json', 'attributes').subscribe(r => {

			for (const x of r) {
				this.stepUnit.push(this.createGroupUnit(
					x.key,
					x.value
				));
			}
		});
	}

	removeGroupStep(idx: number) {
		if (this.groupDelete === true) {

			this.api.delete('attributes', idx).subscribe(
				(r) => {
					if (r) {
						this.stepUnits.removeAt(idx);
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
						this.stepUnits.removeAt(idx);

						this.alert('success', r['statusText'])
					}
				},
				(err) => {
					this.singleView = false;
					this.singleEdit = true;

					this.alert('error', err['status'] + ' - ' + err['statusText'])
				}
			)
		}
	}


	editGroupStep(i) {
		this.editStep = i;
		this.singleEditConfirm = false;

		this.groupEdit = false;
		this.groupEditConfirm = true;
		this.groupConfirm = true;
		this.groupSelect = false;
	}

	editSingleStep(i) {
		this.editStep = i;
		this.groupEditConfirm = false;

		this.singleEdit = false;
		this.singleEditConfirm = true;
		this.singleConfirm = true;
		this.singleSelect = false;
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
