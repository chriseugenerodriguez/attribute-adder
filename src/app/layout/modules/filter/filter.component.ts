import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { IAttribute, API } from '../../../core/index';

@Component({
	selector: 'filter',
	templateUrl: './filter.component.html'
})
export class FilterComponent implements OnInit {

	// TOGGLE
	@Output() open = new EventEmitter<boolean>(true);

	// SINGLE
	oData: FormGroup;
	selectedAttribute: string;
	selectedValue: string;
	selectedOperator: string;
	items: any[] = [];

	// GROUP
	oDatas: FormGroup;
	stepDatas: any;

	// FILTERS
	attributes: Array<string> = [];
	operator: Array<string> = [];
	groupData: Array<string> = ['And', 'Or'];

	@Output() grid = new EventEmitter<object>();

	// EDIT
	eEdit: any;
	eNew: any;
	eConfirm: true;


	constructor(private api: API, private fb: FormBuilder) {
		// SINGLE
		this.oData = this.fb.group({
			attribute: ['', Validators.required],
			operator: ['', Validators.required],
			value: ['', Validators.required],
		});

		this.oDatas = this.fb.group({
			items: this.fb.array([])
		})

		this.stepDatas = <FormArray>this.oDatas.controls['items'];

	}

	ngOnInit() {
		// FILTERS
		this.api.get('./filter/attributes.json', 'image').subscribe(r => {
			this.attributes = r.map(i => i.value);
		});

		this.api.get('./filter/operator.json', 'image').subscribe(r => {
			this.operator = r.map(i => i.value);
		});
	}

	private filter(status) {
		if (status === 'cancel') {
			this.open.emit(false);

			this.eNew = [{}];
			this.eEdit = [{}];
		}

		if (status === 'update') {
			this.open.emit(false);

			const a = this.oDatas.value.items;
			const b = '$filter=';
			const c = [{}];
			const d = [{}];
			let e = '';
			for (let i = 0; i < a.length; i++) {
				c[i] = `${a[i].Attribute}` + ' ' + `${a[i].Operator}` + ' ' + `${a[i].Value}`;
				if (a[i].Group === 'And') {
					d[i] = 'and ' + c[i]
				} else if (a[i].Group === 'Or') {
					d[i] = 'or ' + c[i]
				} else {
					d[i] = c[i];
				}
			};
			e = b + d.join(' ')

			this.api.post('grid.json', e).subscribe(r => {
				this.grid.emit(r);
			});
		}
	}

	group(i, v) {
		this.oDatas.get('items').value[i]['group'] = v;
	}

	groupFind(i, v): boolean {
		const a = this.oDatas.get('items').value[i]['group'];

		if (a) {
			if (a === v) {
				return true;
			}
			return false;
		}
	}

	createSingleStep(v): void {
		if (!this.eNew) {
			this.eEdit = [{ attribute: true, operator: true, value: true }];
			this.eNew = [{ attribute: true, operator: true, value: true }];

			this.oData.addControl('group', new FormControl('', Validators.required));

		} else {
			this.eEdit.push({ attribute: true, operator: true, value: true, group: true });
			this.eNew.push({ attribute: true, operator: true, value: true, group: true });
		}
		this.stepDatas.push(this.createSingleAttribute(v.attribute, v.operator, v.value, v.group));
	}

	createSingleAttribute(a?: string, b?: string, c?: string, d?: string) {
		return this.fb.group({
			Attribute: [a, Validators.required],
			Operator: [b, Validators.required],
			Value: [c, Validators.required],
			Group: [d]
		})
	}

	removeSingleStep(i: number) {
		this.stepDatas.removeAt(i);

		if (this.stepDatas.length === 0) {
			this.oData.removeControl('group');
			this.eEdit = '';
			this.eNew = '';
		}
	}

	change(a, b) {
		if (a === 'attribute') {
			this.eNew[b].attribute = !this.eNew[b].attribute;
		}
		if (a === 'operator') {
			this.eNew[b].operator = !this.eNew[b].operator;
		}
		if (a === 'value') {
			this.eNew[b].value = !this.eNew[b].value;
		}
		if (a === 'group') {
			this.eNew[b].group = !this.eNew[b].group;
		}
	}
}
