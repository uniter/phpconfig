/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import ConfigSet from '../../src/ConfigSet';

describe('ConfigSet', () => {
    let configSet: ConfigSet;

    beforeEach(() => {
        configSet = new ConfigSet([
            {
                'my_first_setting': 'my first value',
                'my_second_setting': 'my second value',
                'my_array_setting': ['my first value'],
                'my_object_setting': { 'first': 'one', 'second': 'two' },
                'my_unique_object_setting': { 'first': 'one' },
            },
            {
                'my_first_setting': '[overridden] my first value',
                'my_second_setting': 'my second value',
                'my_array_setting': ['my second value', 'my third value'],
                'my_object_setting': {
                    'first': '[overridden]',
                    'and third': 'three',
                },
                'my_unique_object_setting': { 'second': 'two' },
            },
        ]);
    });

    describe('concatArrays()', () => {
        it('should correctly concatenate elements from all arrays for the specified setting', () => {
            expect(configSet.concatArrays('my_array_setting')).toEqual([
                'my first value',
                'my second value',
                'my third value',
            ]);
        });

        it('should ignore null or undefined values for the specified setting', () => {
            configSet = new ConfigSet([
                {
                    'my_array_setting': ['first'],
                },
                {
                    'my_array_setting': null,
                },
                {
                    'my_array_setting': undefined,
                },
                {
                    'my_array_setting': ['second'],
                },
            ]);

            expect(configSet.concatArrays('my_array_setting')).toEqual([
                'first',
                'second',
            ]);
        });

        it('should throw when any of the values is not an array', () => {
            configSet = new ConfigSet([
                {
                    'my_array_setting': ['first', 'second'],
                },
                {
                    'my_array_setting': 'I am not valid, as I am not an array!',
                },
            ]);

            expect(() => {
                configSet.concatArrays('my_array_setting');
            }).toThrow(
                'Invalid value for setting my_array_setting: all values must be arrays ' +
                    'but string (I am not valid, as I am not an array!) given'
            );
        });
    });

    describe('mergeObjects()', () => {
        it('should correctly merge all object values for the specified setting', () => {
            expect(configSet.mergeObjects('my_object_setting')).toEqual({
                'first': '[overridden]', // Note that later configs should take precedence
                'second': 'two',
                'and third': 'three',
            });
        });

        it('should ignore null or undefined values for the specified setting', () => {
            configSet = new ConfigSet([
                {
                    'my_object_setting': { 'first': 'one' },
                },
                {
                    'my_object_setting': null,
                },
                {
                    'my_object_setting': undefined,
                },
                {
                    'my_object_setting': { 'last': 'two' },
                },
            ]);

            expect(configSet.mergeObjects('my_object_setting')).toEqual({
                'first': 'one',
                'last': 'two',
            });
        });

        it('should throw when any of the values is not an object', () => {
            configSet = new ConfigSet([
                {
                    'my_object_setting': { 'first': 'one', 'second': 'two' },
                },
                {
                    'my_object_setting':
                        'I am not valid, as I am not an object!',
                },
            ]);

            expect(() => {
                configSet.mergeObjects('my_object_setting');
            }).toThrow(
                'Invalid value for setting my_object_setting: all values must be objects ' +
                    'but string (I am not valid, as I am not an object!) given'
            );
        });
    });

    describe('mergeUniqueObjects()', () => {
        it('should correctly merge all object values for the specified setting', () => {
            expect(
                configSet.mergeUniqueObjects('my_unique_object_setting')
            ).toEqual({
                'first': 'one',
                'second': 'two',
            });
        });

        it('should correctly merge all configs when no setting is given', () => {
            configSet = new ConfigSet([
                { 'first': 'one' },
                { 'second': 'two' },
            ]);

            expect(configSet.mergeUniqueObjects()).toEqual({
                'first': 'one',
                'second': 'two',
            });
        });

        it('should ignore null or undefined values for the specified setting', () => {
            configSet = new ConfigSet([
                {
                    'my_unique_object_setting': { 'first': 'one' },
                },
                {
                    'my_unique_object_setting': null,
                },
                {
                    'my_unique_object_setting': undefined,
                },
                {
                    'my_unique_object_setting': { 'last': 'two' },
                },
            ]);

            expect(
                configSet.mergeUniqueObjects('my_unique_object_setting')
            ).toEqual({
                'first': 'one',
                'last': 'two',
            });
        });

        it('should allow a property to have the same value assigned to it twice within a setting', () => {
            configSet = new ConfigSet([
                {
                    'my_unique_object_setting': {
                        'first': 'one',
                        'second': 'two',
                    },
                },
                {
                    'my_unique_object_setting': { 'first': 'one' }, // Identical value
                },
                {
                    'my_unique_object_setting': { 'third': 'three' },
                },
            ]);

            expect(
                configSet.mergeUniqueObjects('my_unique_object_setting')
            ).toEqual({
                'first': 'one',
                'second': 'two',
                'third': 'three',
            });
        });

        it('should allow a setting to have the same value assigned to it twice across all configs when no setting is given', () => {
            configSet = new ConfigSet([
                {
                    'my_string_setting': 'one',
                    'my_number_setting': 123,
                },
                {
                    'my_string_setting': 'one', // Identical value
                },
            ]);

            expect(configSet.mergeUniqueObjects()).toEqual({
                'my_string_setting': 'one',
                'my_number_setting': 123,
            });
        });

        it('should throw when any of the values is not an object', () => {
            configSet = new ConfigSet([
                {
                    'my_unique_object_setting': {
                        'first': 'one',
                        'second': 'two',
                    },
                },
                {
                    'my_unique_object_setting':
                        'I am not valid, as I am not an object!',
                },
            ]);

            expect(() => {
                configSet.mergeUniqueObjects('my_unique_object_setting');
            }).toThrow(
                'Invalid value for setting my_unique_object_setting: all values must be objects ' +
                    'but string (I am not valid, as I am not an object!) given'
            );
        });

        it("should throw when any of the values' properties conflicts with an earlier setting when setting given", () => {
            configSet = new ConfigSet([
                {
                    'my_unique_object_setting': {
                        'first': 'one',
                        'second': 'two',
                    },
                },
                {
                    'my_unique_object_setting': { 'second': '[different]' }, // Invalid
                },
            ]);

            expect(() => {
                configSet.mergeUniqueObjects('my_unique_object_setting');
            }).toThrow(
                'Invalid value for setting my_unique_object_setting: all objects must be unique ' +
                    'but property "second" has both value (two) and value ([different])'
            );
        });

        it('should throw when any of the settings conflicts with an earlier setting when no setting given', () => {
            configSet = new ConfigSet([
                {
                    'my_string_setting': 'first value',
                },
                {
                    'my_string_setting': '[different]', // Invalid
                },
            ]);

            expect(() => {
                configSet.mergeUniqueObjects();
            }).toThrow(
                'Invalid value for setting my_string_setting: all objects must be unique ' +
                    'but setting has both value (first value) and value ([different])'
            );
        });
    });

    describe('toArray()', () => {
        it('should just return the underlying raw config data objects', () => {
            expect(configSet.toArray()).toEqual([
                {
                    'my_first_setting': 'my first value',
                    'my_second_setting': 'my second value',
                    'my_array_setting': ['my first value'],
                    'my_object_setting': { 'first': 'one', 'second': 'two' },
                    'my_unique_object_setting': { 'first': 'one' },
                },
                {
                    'my_first_setting': '[overridden] my first value',
                    'my_second_setting': 'my second value',
                    'my_array_setting': ['my second value', 'my third value'],
                    'my_object_setting': {
                        'first': '[overridden]',
                        'and third': 'three',
                    },
                    'my_unique_object_setting': { 'second': 'two' },
                },
            ]);
        });
    });
});
