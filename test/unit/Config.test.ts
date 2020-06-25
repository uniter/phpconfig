/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import Config from '../../src/Config';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import RequirerInterface from '../../src/RequirerInterface';
import ConfigSet from '../../src/ConfigSet';

describe('Config', () => {
    let config: Config;
    let requirer: StubbedInstance<RequirerInterface>;

    beforeEach(() => {
        requirer = stubInterface<RequirerInterface>();

        config = new Config(
            requirer,
            {
                'settings': {
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
                },
            } as never, // Use "never" type as the above config is (deliberately) partially invalid
            ConfigSet
        );
    });

    describe('getConfigsForLibrary()', () => {
        it('should be able to fetch the merged config for a library', () => {
            const configSet = config.getConfigsForLibrary(
                'my_main_lib',
                'my_sub_lib'
            );

            expect(configSet.toArray()).toEqual([
                {
                    'first_setting': '[overridden] first value',
                    'second_setting': 'second value',
                },
            ]);
        });

        it('should not attempt to merge config when no sub-library is given', () => {
            const configSet = config.getConfigsForLibrary('my_sub_lib');

            expect(configSet.toArray()).toEqual([
                {
                    'first_setting': 'first value',
                    'second_setting': 'second value',
                },
            ]);
        });

        it("should just return an empty array when no sub-library is given and the main library's config is undefined", () => {
            const configSet = config.getConfigsForLibrary(
                'an_invalid_undefined_lib_config'
            );

            expect(configSet.toArray()).toEqual([]);
        });

        it("should just return the sub-library's config when a sub-library is given but the main library's config is undefined", () => {
            const configSet = config.getConfigsForLibrary(
                'an_invalid_undefined_lib_config',
                'my_sub_lib'
            );

            expect(configSet.toArray()).toEqual([
                {
                    'first_setting': 'first value',
                    'second_setting': 'second value',
                },
            ]);
        });

        it('should just return an empty array when a sub-library is given but its config is undefined', () => {
            const configSet = config.getConfigsForLibrary(
                'my_main_lib',
                'an_invalid_undefined_sub_lib'
            );

            expect(configSet.toArray()).toEqual([]);
        });

        it('should fetch any settings from plugins using the simple syntax', () => {
            requirer.require.withArgs('/path/to/my/main_lib_config').returns({
                'my_setting_for_main_lib': 21,
            });
            requirer.require
                .withArgs('/path/to/my/first_sub_lib_config')
                .returns({
                    'my_first_setting_for_sub_lib': 101,
                });
            requirer.require
                .withArgs('/path/to/my/second_sub_lib_config')
                .returns({
                    'my_second_setting_for_sub_lib': 9876,
                });
            config = new Config(
                requirer,
                {
                    'plugins': [
                        {
                            'my_main_lib': '/path/to/my/main_lib_config',
                        },
                        {
                            'my_sub_lib': '/path/to/my/first_sub_lib_config',
                        },
                        {
                            'my_sub_lib': '/path/to/my/second_sub_lib_config',
                        },
                    ],
                    'settings': {
                        'my_main_lib': {
                            'my_sub_lib': {
                                'first_setting': '[overridden] first value',
                            },
                        },
                        'my_sub_lib': {
                            'first_setting': 'first value',
                            'second_setting': 'second value',
                        },
                    },
                },
                ConfigSet
            );

            const configSet = config.getConfigsForLibrary(
                'my_main_lib',
                'my_sub_lib'
            );

            expect(configSet.toArray()).toEqual([
                { 'my_first_setting_for_sub_lib': 101 },
                { 'my_second_setting_for_sub_lib': 9876 },
                {
                    'first_setting': '[overridden] first value', // Note the merging here
                    'second_setting': 'second value',
                },
            ]);
        });

        it('should fetch any settings from plugins using the complex syntax', () => {
            requirer.require.withArgs('/path/to/my/main_lib_config').returns({
                'my_setting_for_main_lib': 21,
            });
            requirer.require
                .withArgs('/path/to/my/first_sub_lib_config')
                .returns({
                    'my_first_setting_for_sub_lib': 101,
                });
            requirer.require
                .withArgs('/path/to/my/second_sub_lib_config')
                .returns({
                    'my_second_setting_for_sub_lib': 9876,
                });
            config = new Config(
                requirer,
                {
                    'plugins': [
                        {
                            'my_main_lib': {
                                'my_main_lib': '/path/to/my/main_lib_config',
                            },
                        },
                        {
                            'my_main_lib': {
                                'my_sub_lib':
                                    '/path/to/my/first_sub_lib_config',
                            },
                        },
                        {
                            'my_main_lib': {
                                'my_sub_lib':
                                    '/path/to/my/second_sub_lib_config',
                            },
                        },
                    ],
                    'settings': {
                        'my_main_lib': {
                            'my_sub_lib': {
                                // NB: As this is specified in the root "settings" config, this sub-library config
                                //     will also be included when just the main library's config is fetched
                                'first_setting': '[overridden] first value',
                            },
                        },
                        'my_sub_lib': {
                            'first_setting': 'first value',
                            'second_setting': 'second value',
                        },
                    },
                },
                ConfigSet
            );

            expect(
                config.getConfigsForLibrary('my_main_lib').toArray()
            ).toEqual([
                { 'my_setting_for_main_lib': 21 },
                {
                    'my_sub_lib': {
                        'first_setting': '[overridden] first value',
                    },
                },
            ]);
            expect(
                config
                    .getConfigsForLibrary('my_main_lib', 'my_sub_lib')
                    .toArray()
            ).toEqual([
                { 'my_first_setting_for_sub_lib': 101 },
                { 'my_second_setting_for_sub_lib': 9876 },
                {
                    'first_setting': '[overridden] first value', // Note the merging here
                    'second_setting': 'second value',
                },
            ]);
        });

        it('should throw when a plugin attempts to give isolated sub-library config inline rather than a path', () => {
            config = new Config(
                requirer,
                {
                    'plugins': [
                        {
                            'my_sub_lib': {
                                'this is': 'not valid - I should be a path',
                            },
                        },
                    ],
                    'settings': {
                        'my_main_lib': {
                            'my_sub_lib': {
                                'first_setting': 'first value',
                            },
                        },
                        'my_sub_lib': {
                            'second_setting': 'second value',
                        },
                    },
                } as never, // Use "never" type as the above config is (deliberately) partially invalid
                ConfigSet
            );

            expect(() => {
                config.getConfigsForLibrary('my_main_lib', 'my_sub_lib');
            }).toThrow(
                'Isolated value for sub-library "my_sub_lib" should be a path'
            );
        });

        it("should throw when the main library's config is a boolean", () => {
            expect(() => {
                config.getConfigsForLibrary('an_invalid_boolean_lib_config');
            }).toThrow(
                'Config for main library "an_invalid_boolean_lib_config" should be an object'
            );
        });

        it("should ignore when the main library's config is null", () => {
            const configSet = config.getConfigsForLibrary(
                'an_invalid_null_lib_config'
            );

            expect(configSet.toArray()).toEqual([]);
        });

        it("should throw when the main library's config is a number", () => {
            expect(() => {
                config.getConfigsForLibrary('an_invalid_number_lib_config');
            }).toThrow(
                'Config for main library "an_invalid_number_lib_config" should be an object'
            );
        });

        it("should throw when the main library's config is a string", () => {
            expect(() => {
                config.getConfigsForLibrary('an_invalid_string_lib_config');
            }).toThrow(
                'Config for main library "an_invalid_string_lib_config" should be an object'
            );
        });
    });
});
