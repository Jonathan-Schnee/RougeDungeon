var NamespaceReflection;
(function (NamespaceReflection) {
    function findNamespaceName(_namespace) {
        for (let prop in window)
            if (window[prop] == _namespace)
                return prop;
        return null;
        // @ts-ignore
    }
    NamespaceReflection.findNamespaceName = findNamespaceName;
    class ClassA {
        static getNamespace() {
            return ClassA.∆ínamespace;
        }
    }
    ClassA.type = "ClassA in NamespaceReflection";
    // @ts-ignore
    ClassA.args = arguments;
    // @ts-ignore
    /// tslint:disable-next-line: variable-name
    ClassA.∆ínamespace = findNamespaceName(arguments[0]);
    NamespaceReflection.ClassA = ClassA;
})(NamespaceReflection || (NamespaceReflection = {}));
//# sourceMappingURL=ClassA.js.map