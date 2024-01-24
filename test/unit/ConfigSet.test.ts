/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
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
            expect(configSet.concatArrays('my_array_setting')).to.deep.equal([
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

            expect(configSet.concatArrays('my_array_setting')).to.deep.equal([
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
            }).to.throw(
                'Invalid value for setting my_array_setting: all values must be arrays ' +
                    'but string (I am not valid, as I am not an array!) given',
            );
        });
    });

    describe('getBoolean()', () => {
        it('should return the default value of true when no config specifies a value for the setting', () => {
            configSet = new ConfigSet([{ 'my-other-setting': 21 }, {}, {}]);

            expect(configSet.getBoolean('my-setting', true)).to.deep.equal(
                true,
            );
        });

        it('should return the default value of false when no config specifies a value for the setting', () => {
            configSet = new ConfigSet([
                {},
                { 'your-other-setting': 'a value' },
                {},
            ]);

            expect(configSet.getBoolean('my-setting', false)).to.deep.equal(
                false,
            );
        });

        it("should allow later configs' values to take precedence", () => {
            configSet = new ConfigSet([
                {
                    myBoolean: false,
                    myNumber: 123,
                    myString: 'hello',
                },
                {
                    yourScalar: 'a value',
                },
                {
                    myBoolean: true,
                    myNumber: 987,
                    myString: 'well hello!',
                },
            ]);

            expect(configSet.getBoolean('myBoolean')).to.equal(true);
        });

        it('should raise an error when the final value for the setting has a non-boolean value', () => {
            configSet = new ConfigSet([
                {
                    myBoolean: false,
                },
                {
                    yourScalar: 'a value',
                },
                {
                    myBoolean: 'not a valid value',
                },
            ]);

            expect(() => {
                configSet.getBoolean('myBoolean');
            }).to.throw(
                'Expected value for setting "myBoolean" to be a boolean but it was a string',
            );
        });
    });

    describe('mergeAll()', () => {
        it('should just return an empty object when only empty configs given', () => {
            configSet = new ConfigSet([{}, {}, {}]);

            expect(configSet.mergeAll()).to.deep.equal({});
        });

        it("should allow later configs' scalar values to take precedence", () => {
            configSet = new ConfigSet([
                {
                    myBoolean: false,
                    myNumber: 123,
                    myString: 'hello',
                },
                {
                    yourScalar: 'a value',
                },
                {
                    myBoolean: true,
                    myNumber: 987,
                    myString: 'well hello!',
                },
            ]);

            expect(configSet.mergeAll()).to.deep.equal({
                myBoolean: true,
                myNumber: 987,
                myString: 'well hello!',
                yourScalar: 'a value',
            });
        });

        it('should merge object values for the same setting', () => {
            configSet = new ConfigSet([
                {
                    myObject: { first: 21 },
                },
                {
                    yourObject: { aNumber: 987 },
                },
                {
                    myObject: { second: 101 },
                },
            ]);

            expect(configSet.mergeAll()).to.deep.equal({
                myObject: { first: 21, second: 101 },
                yourObject: { aNumber: 987 },
            });
        });

        it('should not modify the original object values for the same setting', () => {
            const config1 = {
                    myObject: { first: 21 },
                },
                config2 = {
                    yourObject: { aNumber: 987 },
                },
                config3 = {
                    myObject: { second: 101 },
                };

            configSet = new ConfigSet([config1, config2, config3]);

            configSet.mergeAll();

            expect(config1).to.deep.equal({
                myObject: { first: 21 },
            });
            expect(config2).to.deep.equal({
                yourObject: { aNumber: 987 },
            });
            expect(config3).to.deep.equal({
                myObject: { second: 101 },
            });
        });

        it('should concatenate array values for the same setting', () => {
            configSet = new ConfigSet([
                {
                    myArray: ['first'],
                },
                {
                    yourArray: ['a value'],
                },
                {
                    myArray: ['second'],
                },
            ]);

            expect(configSet.mergeAll()).to.deep.equal({
                myArray: ['first', 'second'],
                yourArray: ['a value'],
            });
        });

        it('should not modify the original array values for the same setting', () => {
            const object1 = {
                    myArray: ['first'],
                },
                object2 = {
                    yourArray: ['a value'],
                },
                object3 = {
                    myArray: ['second'],
                };

            configSet = new ConfigSet([object1, object2, object3]);

            configSet.mergeAll();

            expect(object1).to.deep.equal({
                myArray: ['first'],
            });
            expect(object2).to.deep.equal({
                yourArray: ['a value'],
            });
            expect(object3).to.deep.equal({
                myArray: ['second'],
            });
        });

        it('should allow an array to replace a scalar', () => {
            configSet = new ConfigSet([
                {
                    myValue: 'I am not an array',
                },
                {
                    yourScalar: 'a value',
                },
                {
                    myValue: ['my first element', 'my second element'],
                },
            ]);

            expect(configSet.mergeAll()).to.deep.equal({
                myValue: ['my first element', 'my second element'],
                yourScalar: 'a value',
            });
        });
    });

    describe('mergeObjects()', () => {
        it('should correctly merge all object values for the specified setting', () => {
            expect(configSet.mergeObjects('my_object_setting')).to.deep.equal({
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

            expect(configSet.mergeObjects('my_object_setting')).to.deep.equal({
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
            }).to.throw(
                'Invalid value for setting my_object_setting: all values must be objects ' +
                    'but string (I am not valid, as I am not an object!) given',
            );
        });
    });

    describe('mergeUniqueObjects()', () => {
        it('should correctly merge all object values for the specified setting', () => {
            expect(
                configSet.mergeUniqueObjects('my_unique_object_setting'),
            ).to.deep.equal({
                'first': 'one',
                'second': 'two',
            });
        });

        it('should correctly merge all configs when no setting is given', () => {
            configSet = new ConfigSet([
                { 'first': 'one' },
                { 'second': 'two' },
            ]);

            expect(configSet.mergeUniqueObjects()).to.deep.equal({
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
                configSet.mergeUniqueObjects('my_unique_object_setting'),
            ).to.deep.equal({
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
                configSet.mergeUniqueObjects('my_unique_object_setting'),
            ).to.deep.equal({
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

            expect(configSet.mergeUniqueObjects()).to.deep.equal({
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
            }).to.throw(
                'Invalid value for setting my_unique_object_setting: all values must be objects ' +
                    'but string (I am not valid, as I am not an object!) given',
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
            }).to.throw(
                'Invalid value for setting my_unique_object_setting: all objects must be unique ' +
                    'but property "second" has both value (two) and value ([different])',
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
            }).to.throw(
                'Invalid value for setting my_string_setting: all objects must be unique ' +
                    'but setting has both value (first value) and value ([different])',
            );
        });
    });

    describe('toArray()', () => {
        it('should just return the underlying raw config data objects', () => {
            expect(configSet.toArray()).to.deep.equal([
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
