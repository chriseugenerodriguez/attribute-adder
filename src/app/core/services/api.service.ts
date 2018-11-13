import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

export let api = '';
export let localbase = 'assets/json/';
export let headers = new Headers({ 'Content-Type': 'application/json' });
export let options = new RequestOptions({ headers: headers });

@Injectable()
export class API {
	apibase = '';

	constructor(private http: Http) { }

	public get(localfile: string, apiname: string): Observable<any[]> {
		// if (environment.production) {
		api = this.apibase + apiname
		// } else {
		// 	api = localbase + localfile;
		// }
		return this.http.get(api)
			.map((r: Response) => r.json())
			.catch(this._errorHandler);
	}

	// COMMANDS (SUBMIT, SAVE, ETC.)
	public post(apiname: string, data?: any) {
		const body = JSON.stringify(data);
		// if (environment.production) {
		api = this.apibase + apiname
		// } else {
		// 	api = localbase;
		// }

		return this.http.post(api, body, options)
			.map((res: Response) => res.json())
			.catch(this._errorHandler)
	}

	// UPDATE (change value in object)
	public put(apiname: string, data?: any) {
		const body = JSON.stringify(data);
		// if (environment.production) {
		api = this.apibase + apiname
		// } else {
		// 	api = localbase;
		// }

		return this.http.put(api, body, options)
			.map((res: Response) => res)
			.catch(this._errorHandler)
	}

	// UPDATE (change value in object)
	public patch(apiname: string, data?: any) {
		const body = JSON.stringify(data);
		// if (environment.production) {
		api = this.apibase + apiname
		// } else {
		// 	api = localbase;
		// }

		return this.http.patch(api, body, options)
			.map((res: Response) => res)
			.catch(this._errorHandler)
	}

	public delete(apiname: string, data?: any) {
		const body = JSON.stringify(data);
		// if (environment.production) {
		api = this.apibase + apiname
		// } else {
		// 	api = localbase;
		// }

		return this.http.delete(api, options)
			.map((res: Response) => res)
			.catch(this._errorHandler)
	}

	private _errorHandler(error: Response) {
		console.error('error', error);
		return Observable.throw(error || 'Server Error');
	}
}
