import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';

export let api = '';
export let localbase = 'assets/json/';
export let headers = new Headers({ 'Content-Type': 'application/json' });
export let options = new RequestOptions({ headers: headers });

// DOWNLOAD HEADERS
export let header = new Headers({responseType: 'blob', observe: 'response'});
export let option = new RequestOptions({ headers: header });

@Injectable()
export class API {
	apibase = '';

	constructor(private http: Http) { }

	public get(localfile: string, apiname: string): Observable<any[]> {
	
		api = this.apibase + apiname
	
	
	
		return this.http.get(api)
			.map((r: Response) => r.json())
			.catch(this._errorHandler);
	}


	public post(apiname: string, data?: any) {
		const body = JSON.stringify(data);
	
		api = this.apibase + apiname
	
	
	

		return this.http.post(api, body, options)
			.map((res: Response) => res.json())
			.catch(this._errorHandler)
	}


	public download(apiname: string, data?: any) {
		const body = data;
	
		api = this.apibase + apiname
	
	
	

		return this.http.post(api, body, option).map(res => ({file: res['_body'], type: res.headers.get('content-type')}))
			.catch(this._errorHandler)
	}


	public put(apiname: string, data?: any) {
		const body = JSON.stringify(data);
	
		api = this.apibase + apiname
	
	
	

		return this.http.put(api, body, options)
			.map((res: Response) => res)
			.catch(this._errorHandler)
	}


	public patch(apiname: string, data?: any) {
		const body = JSON.stringify(data);
	
		api = this.apibase + apiname
	
	
	

		return this.http.patch(api, body, options)
			.map((res: Response) => res)
			.catch(this._errorHandler)
	}

	public delete(apiname: string, data?: any) {
		const body = JSON.stringify(data);
	
		api = this.apibase + apiname
	
	
	

		return this.http.delete(api, options)
			.map((res: Response) => res)
			.catch(this._errorHandler)
	}

	private _errorHandler(error: Response) {
		console.error('error', error);
		return Observable.throw(error || 'Server Error');
	}
}
