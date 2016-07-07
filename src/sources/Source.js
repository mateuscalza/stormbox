export default class Source {

    find({ value }) {
        return new Promise((resolve, reject) => reject(new Error('Source class is abstract!')));
    }

    abort() {
        
    }

}
