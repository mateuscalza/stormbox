import StormBox from '../components/StormBox';

export default Parent => class extends Parent {

    relatedReplica() {
        this.relatedApply(element => this.replica(element));
    }

    replica(element) {
        if (element.disabled || element.hasAttribute('disabled')) {
            this.disable();
        }
        if (element.readOnly || element.hasAttribute('readonly')) {
            this.canRead();
        }
        if (element.required || element.hasAttribute('required')) {
            this.required();
        }
    }

};
