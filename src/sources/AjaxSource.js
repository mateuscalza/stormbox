import Source from './Source';

function nestedSerialize(params, history = []) {
    return Object.keys(params).map(function (key) {
        if(typeof params[key] === 'object' && params[key] !== null) {
            return nestedSerialize(params[key], [...history, key]);
        }
        const keys = [...history, key];
        const mainKey = keys.shift();
        return encodeURIComponent(mainKey + (keys.length ? '[' + keys.join('][') + ']' : '')) + '=' + encodeURIComponent(params[key])
    }).join('&');
}

export default class AjaxSource {

    constructor(url, headerXMLHttpRequest = true, beforeSend = null) {
        this.url = url;
        this.request = null;
        this.headerXMLHttpRequest = headerXMLHttpRequest;
        this.beforeSend = beforeSend;
    }

    prepareRequest(params) {
        this.request = new XMLHttpRequest();
        const paramUrl = nestedSerialize(params);
        this.request.open('GET', `${this.url}?${paramUrl}`, true);
        if(this.headerXMLHttpRequest) {
            this.request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        }
        this.beforeSend && this.beforeSend(this.request);
    }

    abort() {
        this.request && this.request.abort && this.request.abort();
    }

    send() {
        return new Promise((resolve, reject) => {
            this.request.onreadystatechange = () => {
                if(this.request.readyState != 4) {
                    return;
                }
                if(this.request.status == 0) {
                    return resolve('aborted');
                }
                if (this.request.status == 200) {
                    let json;
                    try {
                        json = JSON.parse(this.request.responseText);
                    } catch (err) {
                        return reject(new Error('Parsing Error: invalid response. ' + this.request.responseText.replace(/\n/, '')));
                    }
                    this.request = null;
                    resolve(json);
                } else {
                    let error = `Error Code: ${this.request.status}`;
                    try {
                        const parsedError = JSON.parse(this.request.responseText);
                        error += this.request.statusText && this.request.statusText.trim().length ? `; Status: ${this.request.statusText}` : '';
                        if(parsedError.message) {
                            if(this.request.status == 400) {
                                return reject(parsedError);
                            }
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
