import Source from './Source';

export default class ArraySource {

    constructor(data = []) {
        this.data = data;
    }

    find({ value }) {
        return new Promise(resolve => {
            resolve({
                data: this.data
            });
        });
    }

}
