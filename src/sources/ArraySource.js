import Source from './Source';

export default class ArraySource {

    constructor(data = []) {
        this.data = data;
    }

    async find({ value }) {
        return {
            data: this.data
        };
    }

}
