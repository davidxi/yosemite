var _ = {};

_.has = function(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
};

_.isEmpty = function(a) {
    if (Array.isArray(a)) {
        return a.length === 0;
    } else if (typeof a === 'object') {
        for (var k in a) {
           if (_.has(a, k)) return false;
        }
        return true;
    } else {
        return !a;
    }
};
