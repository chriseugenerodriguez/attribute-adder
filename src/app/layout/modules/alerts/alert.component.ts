import { Component, OnInit, Input } from '@angular/core';

import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
	selector: 'alerts',
	templateUrl: './alert.component.html'
})
export class AlertsComponent implements OnInit {

	// MESSAGE
	@Input() message: any = [];

	constructor() {
	}

	ngOnInit() {}

	alert(a, b) {
		const c = {type: a, value: b};
		this.message.push(c)
	}

	close(a: AlertComponent) {
		this.message = this.message.filter((i) => i !== a);
	}
}
