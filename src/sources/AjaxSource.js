import Source from './Source';

export default class AjaxSource {

    constructor(url) {
        this.url = url;
        this.request = null;
    }

    prepareRequest(params) {
        this.request = new XMLHttpRequest();
        const paramUrl = Object.keys(params).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        }).join('&');
        this.request.open('GET', `${this.url}?${paramUrl}`, true);
    }

    abort() {
        this.request && this.request.abort && this.request.abort();
    }

    send() {
        return new Promise((resolve, reject) => {
            this.request.onreadystatechange = () => {
                console.log('readyState change', this.request.readyState, this.request.status, this.request);
                if (this.request.readyState == 4 && this.request.status == 200) {
                    let json;
                    try {
                        json = JSON.parse(this.request.responseText);
                    } catch (err) {
                        return reject(new Error('Parsing Error: invalid response. ' + this.request.responseText.replace(/\n/, '')));
                    }
                    this.request = null;
                    resolve(json);
                } else if (this.request.readyState == 4 && this.request.status != 200) {
                    let error = `Error Code: ${this.request.status}`;
                    try {
                        const parsedError = JSON.parse(this.request.responseText);
                        error += this.request.statusText && this.request.statusText.trim().length ? `; Status: ${this.request.statusText}` : '';
                        if(parsedError.message) {
                            error += parsedError.message && parsedError.message.trim().length ? `; Status: ${parsedError.message.trim()}` : '';
                        } else {
                            error += this.request.responseText && this.request.responseText.trim().length ? `; Status: ${this.request.responseText.trim()}` : '';
                        }
                    } catch (err) {
                        error += this.request.statusText && this.request.statusText.trim().length ? `; Status: ${this.request.statusText}` : '';
                        error += this.request.responseText && this.request.responseText.trim().length ? `; Status: ${this.request.responseText.trim()}` : '';
                    }
                    reject(new Error(error));
                }
            };
            this.request.send();
        });
    }

    find(params) {
        this.prepareRequest(params);
        return this.send();
    }

}
