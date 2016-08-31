'use strict';

var PropChecker = require('../../lib/PropChecker'),
    propName = 'testingProp',
    staticMethods = {
        'isRequired': {
            validValues: [].concat(numbers, strings, bool, objects, arrays, dates, errors, regexps, fns),
            invalidValues: [].concat(nullAndUndef),
            errMessage: 'Property "' + propName + '" is required'
        },
        'isString': {
            validValues: [].concat(nullAndUndef, strings),
            invalidValues: [].concat(numbers, bool, objects, arrays, dates, errors, regexps, fns)
        },
        'isNumber': {
            validValues: [].concat(nullAndUndef, numbers),
            invalidValues: [].concat(strings, bool, objects, arrays, dates, errors, regexps, fns)
        },
        'isBoolean': {
            validValues: [].concat(nullAndUndef, bool),
            invalidValues: [].concat(numbers, strings, objects, arrays, dates, errors, regexps, fns)
        },
        'isArray': {
            validValues: [].concat(nullAndUndef, arrays),
            invalidValues: [].concat(numbers, strings, bool, objects, dates, errors, regexps, fns)
        },
        'isObject': {
            validValues: [].concat(nullAndUndef, objects),
            invalidValues: [].concat(numbers, strings, bool, arrays, dates, errors, regexps, fns)
        },
        'isDate': {
            validValues: [].concat(nullAndUndef, dates),
            invalidValues: [].concat(numbers, strings, bool, objects, arrays, errors, regexps, fns)
        },
        'isFunction': {
            validValues: [].concat(nullAndUndef, fns),
            invalidValues: [].concat(numbers, strings, bool, objects, arrays, dates, errors, regexps)
        },
        'isRegExp': {
            validValues: [].concat(nullAndUndef, regexps),
            invalidValues: [].concat(numbers, strings, bool, objects, arrays, dates, errors, fns)
        },
        'isError': {
            validValues: [].concat(nullAndUndef, errors),
            invalidValues: [].concat(numbers, strings, bool, objects, arrays, dates, regexps, fns)
        },
        'isArrayOf': {
            validValues: [],
            invalidValues: []
        },
        'isEqual': {
            validValues: [],
            invalidValues: []
        }
    };

describe('Testing checkers in "lib/PropChecker"...', function() {
    describe('checkers', function() {
        it('should to have public checkers: ' + Object.getOwnPropertyNames(staticMethods).map(function(method) {
            return '\n        - ' + method;
        }) + '\n        ', function() {

            Object.getOwnPropertyNames(staticMethods).forEach(function(method) {
                expect(PropChecker).to.have.ownProperty(method);
            });
        });
    });

    Object.getOwnPropertyNames(staticMethods).forEach(function(method) {
        var
            validValues   = staticMethods[method].validValues,
            invalidValues = staticMethods[method].invalidValues,
            errMessage    = staticMethods[method].errMessage || 'Property "' + propName + '" must be';

        if (!validValues.length && !invalidValues.length) {
            return;
        }

        describe('checker "' + method + '"', function() {
            it(method + ' should return undefined with valid values', function() {
                validValues.forEach(function(value) {
                    expect(function() {
                        return PropChecker[method].check(propName, value);
                    }).to.not.throw();

                    expect(PropChecker[method].check(propName, value)).to.be.undefined;
                });
            });

            it(method + ' should return TypeError with invalid values', function() {
                invalidValues.forEach(function(value) {
                    var
                        result = PropChecker[method].check(propName, value);

                    expect(result).to.be.an.instanceof(TypeError);
                    expect(result.message).to.have.string(errMessage);
                });
            });
        });
    });

    describe('checker "isArrayOf"', function() {
        it('isArrayOf should work with instance of PropChecker only', function() {
            var
                except = ['isArrayOf', 'isEqual', 'isDeepEqual'],
                validValues = [];

            Object.getOwnPropertyNames(staticMethods).forEach(function(method) {
                if (~except.indexOf(method)) {
                    return;
                }

                validValues.push(PropChecker[method]);
            });

            validValues.forEach(function(value) {
                expect(function() {
                    return PropChecker.isArrayOf(value);
                }).to.not.throw();
            });
        });

        it('isArrayOf should throw error with any non PropChecker values', function() {
            var
                invalid = [].concat(nullAndUndef, strings, numbers, bool, objects, arrays, dates, errors, regexps, fns);

            invalid.forEach(function(value) {
                expect(function() {
                    return PropChecker.isArrayOf(value);
                }).to.throw(TypeError, 'Type checker function must be an instance of PropChecker');
            });
        });

        it('isArrayOf should return TypeError if validate not array except null and undefined', function() {
            var
                invalid = [].concat(numbers, strings, bool, objects, dates, fns),
                isArrayOfNumber = PropChecker.isArrayOf(PropChecker.isNumber);

            invalid.forEach(function(value) {
                var
                    result = isArrayOfNumber.check(propName, value);

                expect(result).to.be.an.instanceof(TypeError);
                expect(result.message).to.have.string('Property "' + propName + '" must be an array');
            });
        });

        it('isArrayOf should return undefined if array elements have compatible type', function() {
            var
                isArrayOfNumber = PropChecker.isArrayOf(PropChecker.isNumber),
                isArrayOfArray = PropChecker.isArrayOf(PropChecker.isArray),
                isArrayOfObject = PropChecker.isArrayOf(PropChecker.isObject),
                isArrayOfString = PropChecker.isArrayOf(PropChecker.isString);

            numbers.forEach(function(value) {
                expect(function() {
                    return isArrayOfNumber.check(propName, [value]);
                }).to.not.throw();

                expect(isArrayOfNumber.check(propName, [value])).to.be.undefined;
            });

            strings.forEach(function(value) {
                expect(function() {
                    return isArrayOfString.check(propName, [value]);
                }).to.not.throw();

                expect(isArrayOfString.check(propName, [value])).to.be.undefined;
            });

            objects.forEach(function(value) {
                expect(function() {
                    return isArrayOfObject.check(propName, [value]);
                }).to.not.throw();

                expect(isArrayOfObject.check(propName, [value])).to.be.undefined;
            });

            arrays.forEach(function(value) {
                expect(function() {
                    return isArrayOfArray.check(propName, [value]);
                }).to.not.throw();

                expect(isArrayOfArray.check(propName, [value])).to.be.undefined;
            });
        });

        it('isArrayOf should return TypeError if array elements have not compatible type', function() {
            var
                invalidValues = [].concat(nullAndUndef, strings, bool, objects, arrays, dates, fns),
                isArrayOfNumber = PropChecker.isArrayOf(PropChecker.isNumber);

            invalidValues.forEach(function(value) {
                var
                    result = isArrayOfNumber.check(propName, [value]);

                expect(result).to.be.an.instanceof(TypeError);
                expect(result.message).to.have.string('Property "' + propName + '" have wrong element in array');
            });
        });
    });

    describe('checker "isEqual"', function() {
        it('isEqual should accept any values except null and undefined and return new PropChecker', function() {
            var
                validValues = [].concat(numbers, strings, bool, objects, arrays, dates, fns);

            validValues.forEach(function(value) {
                expect(function() {
                    return PropChecker.isEqual(value);
                }).to.not.throw();

                expect(PropChecker.isEqual(value)).to.be.an.instanceof(PropChecker);
            });
        });

        it('isEqual should throw error with null and undefined', function() {
            var
                invalidValues = [].concat(nullAndUndef);

            invalidValues.forEach(function(value) {
                expect(function() {
                    return PropChecker.isEqual(value);
                }).to.throw(TypeError, 'You should pass an any value');
            });
        });

        it('isEqual should no throw error and return undefined when values is equal', function() {
            var
                valid = [].concat(strings, bool, objects, arrays, dates, fns);

            valid.forEach(function(value) {
                expect(function() {
                    return PropChecker.isEqual(value).check('test value', value);
                }).to.not.throw();

                expect(PropChecker.isEqual(value).check('test value', value)).to.be.undefined;
            });
        });

        it('isEqual should return TypeError when values is not equal', function() {
            var
                valid = [].concat(numbers, strings, bool, objects, arrays, dates, fns);

            valid.forEach(function(value) {
                var
                    notEqualValue = 100500,
                    result        = PropChecker.isEqual(value).check(propName, notEqualValue);

                expect(result).to.be.an.instanceof(TypeError);
                expect(result.message).to.have.string('Property "' + propName + '" must be equal to "' + value + '"');
            });
        });
    });
});
