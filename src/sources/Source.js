export default class Source {

    async find({ value }) {
        throw new Error('Source class is abstract!');
    }

    abort() {
        
    }

}
