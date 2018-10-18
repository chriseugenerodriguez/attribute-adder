import { FormControl, Validators } from '@angular/forms';

export class CustomValidators extends Validators {

	static validate(c: FormControl) {
		if (c.value.length > 0) {
			console.log('c', c.value.length);
			return true;
		} else {
			return null;
		}
	}
}


