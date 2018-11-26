import { Component, OnInit, Output, EventEmitter, Renderer2, ElementRef, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { API } from '../../../core/index';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'filter',
	templateUrl: './filter.component.html'
})
export class FilterComponent implements OnInit {


	@ViewChild('type') input: ElementRef;


	@Output() open = new EventEmitter<boolean>(true);


	message: Array<object> = [];


	oData: FormGroup;
	selectedAttribute: string;
	selectedValue: string;
	selectedOperator: string;
	items: any[] = [];


	oDatas: FormGroup;
	stepDatas: any;


	attributes: Array<string> = [];
	operator: Array<string> = [];
	groupData: Array<string> = ['And', 'Or'];

	@Output() grid = new EventEmitter<any>(true);


	eEdit: any;
	eNew: any;
	eConfirm: true;


	constructor(private api: API, private fb: FormBuilder, private renderer: Renderer2) {
	
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
	
		this.api.get('./filter/attributes.json', '/parts/getfields').subscribe(r => {
			this.attributes = r['value'];
		});

		this.api.get('./filter/operator.json', '/parts/getsearchfilteroperators').subscribe(r => {
			this.operator = r['value'];
		});
	}

	attributeSelected(v) {
		const a = v.Type;

		if (a === 'Numeric') {
			this.renderer.setAttribute(this.input.nativeElement, 'type', 'number');
		} else {
			this.renderer.setAttribute(this.input.nativeElement, 'type', 'text');
		}
	}

	private filter(status) {
		if (status === 'cancel') {
			this.open.emit(false);

			this.eNew = [{}];
			this.eEdit = [{}];
		}

		if (status === 'update') {
			const a = this.oDatas.value.items;
			const b = '?$filter=';
			const c = [{}];
			const d = [{}];
			let e = 'parts';


			for (let i = 0; i < a.length; i++) {

				this.attributes.forEach((v) => {
					if (v['FieldName'] === a[i].Attribute) {
						if (v['Type'] === 'Numeric') {
							c[i] = `${a[i].Attribute}` + ' ' + `${a[i].Operator}` + ' ' + `${a[i].Value}`;
						}
						if (v['Type'] === 'String') {
						
							c[i] = `${a[i].Attribute}` + " " + `${a[i].Operator}` + " " + "'" + `${a[i].Value}` + "'";
						}
					}
				});

				if (a[i].Group === 'And') {
					d[i] = ' And ' + c[i]
				} else if (a[i].Group === 'Or') {
					d[i] = ' Or ' + c[i]
				} else {
					d[i] = c[i];
				}
			};
			e = e + b + d.join('');

			this.api.get('grid.json', e + '&$select=PartID,Brand,Description').subscribe(r => {
				this.grid.emit(r['value']);
				this.open.emit(false);
			},
			(err) => {
				this.alert('error', err['status'] + ' - ' + err['statusText']);
			})
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

	
		this.renderer.setAttribute(this.input.nativeElement, 'type', 'text');

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
