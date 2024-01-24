/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import SerialisationChecker from '../../src/SerialisationChecker';

describe('SerialisationChecker', () => {
    let serialisationChecker: SerialisationChecker;

    beforeEach(() => {
        serialisationChecker = new SerialisationChecker();
    });

    describe('isSerialisable()', () => {
        it('should return true for an object containing only scalars and nested objects and arrays with scalars', () => {
            expect(
                serialisationChecker.isSerialisable({
                    'my_boolean': true,
                    'my_null': null,
                    'my_number': 21,
                    'my_outer_object': {
                        'my_sub_prop': 1001,
                        'my_inner_object': {
                            'my_sub_sub_prop': 9876,
                        },
                    },
                    'my_array': [21, 'my element'],
                    'my_string': 'hello world',
                    'my_undefined': undefined,
                }),
            ).to.equal(true);
        });

        it('should return false for an object containing a function', () => {
            expect(
                serialisationChecker.isSerialisable({
                    'my_func': () => {
                        return 'functions are not serialisable!';
                    },
                }),
            ).to.equal(false);
        });

        it('should return false for an object containing a regex', () => {
            expect(
                serialisationChecker.isSerialisable({
                    'my_regex': /regexes are not serialisable!/,
                }),
            ).to.equal(false);
        });

        it('should return false for a circular structure', () => {
            const myObject: Record<string, unknown> = { 'a_prop': 21 };

            myObject['my_circular_reference'] = myObject;

            expect(serialisationChecker.isSerialisable(myObject)).to.equal(
                false,
            );
        });
    });
});
