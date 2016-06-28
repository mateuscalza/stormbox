import Source from './Source';

export default class AjaxSource {

    constructor(url) {
        this.url = url;
        this.request = null;
    }

    prepareRequest(params) {
        this.request = new XMLHttpRequest();
        const paramUrl = Object.keys(params).map(function(key) {
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
                    const json = JSON.parse(this.request.responseText);
                    this.request = null;
                    resolve(json);
                } else if(this.request.readyState == 4 && this.request.status != 200) {
                    reject(new Error(this.request.responseText));
                }
            };
            this.request.send();
        });
    }

    async find(params) {
        this.prepareRequest(params);
        return await this.send();
    }

}
