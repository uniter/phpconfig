/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import Config from '../../src/Config';

describe('Config', () => {
    let config: Config;

    beforeEach(() => {
        config = new Config({
            'my_main_lib': {
                'my_sub_lib': {
                    'first_setting': '[overridden] first value',
                },
            },
            'my_sub_lib': {
                'first_setting': 'first value',
                'second_setting': 'second value',
            },
            'an_invalid_boolean_lib_config': true,
            'an_invalid_null_lib_config': null,
            'an_invalid_number_lib_config': 1234,
            'an_invalid_string_lib_config': 'my string',
            'an_invalid_undefined_lib_config': undefined,
        });
    });

    describe('getConfigForLibrary()', () => {
        it('should be able to fetch the merged config for a library', () => {
            const data = config.getConfigForLibrary(
                'my_main_lib',
                'my_sub_lib'
            );

            expect(data).toEqual({
                'first_setting': '[overridden] first value',
                'second_setting': 'second value',
            });
        });

        it('should not attempt to merge config when no sub-library is given', () => {
            const data = config.getConfigForLibrary('my_sub_lib');

            expect(data).toEqual({
                'first_setting': 'first value',
                'second_setting': 'second value',
            });
        });

        it("should just return an empty object when no sub-library is given and the main library's config is undefined", () => {
            const data = config.getConfigForLibrary(
                'an_invalid_undefined_lib_config'
            );

            expect(data).toEqual({});
        });

        it("should just return the sub-library's config when a sub-library is given but the main library's config is undefined", () => {
            const data = config.getConfigForLibrary(
                'an_invalid_undefined_lib_config',
                'my_sub_lib'
            );

            expect(data).toEqual({
                'first_setting': 'first value',
                'second_setting': 'second value',
            });
        });

        it('should just return an empty object when a sub-library is given but its config is undefined', () => {
            const data = config.getConfigForLibrary(
                'my_main_lib',
                'an_invalid_undefined_sub_lib'
            );

            expect(data).toEqual({});
        });

        it("should throw when the main library's config is a boolean", () => {
            expect(() => {
                config.getConfigForLibrary('an_invalid_boolean_lib_config');
            }).toThrow(
                'Config for main library "an_invalid_boolean_lib_config" should be an object'
            );
        });

        it("should throw when the main library's config is null", () => {
            expect(() => {
                config.getConfigForLibrary('an_invalid_null_lib_config');
            }).toThrow(
                'Config for main library "an_invalid_null_lib_config" should not be null'
            );
        });

        it("should throw when the main library's config is a number", () => {
            expect(() => {
                config.getConfigForLibrary('an_invalid_number_lib_config');
            }).toThrow(
                'Config for main library "an_invalid_number_lib_config" should be an object'
            );
        });

        it("should throw when the main library's config is a string", () => {
            expect(() => {
                config.getConfigForLibrary('an_invalid_string_lib_config');
            }).toThrow(
                'Config for main library "an_invalid_string_lib_config" should be an object'
            );
        });
    });
});
