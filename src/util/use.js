export default function (MainExtendedParent = class {}, ...mixins) {
    return (
        mixins
            .reduce((NewParent, Mixin) => {
                return Mixin(NewParent);
            }, MainExtendedParent)
    );
}