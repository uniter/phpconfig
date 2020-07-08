/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { StubbedInstance, stubInterface } from 'ts-sinon';
import ConfigExporter from '../../src/ConfigExporter';
import SerialisationCheckerInterface from '../../src/SerialisationCheckerInterface';

describe('ConfigExporter', () => {
    let exporter: ConfigExporter;
    let rootConfig: RootConfig;
    let serialisationChecker: StubbedInstance<SerialisationCheckerInterface>;

    beforeEach(() => {
        rootConfig = {
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
                'a_null_lib_config': null,
                'an_invalid_number_lib_config': 1234,
                'an_invalid_string_lib_config': 'my string',
                'an_invalid_undefined_lib_config': undefined,
            },
        } as never; // Use "never" type as the above config is (deliberately) partially invalid
        serialisationChecker = stubInterface<SerialisationCheckerInterface>();

        serialisationChecker.isSerialisable.returns(true);

        exporter = new ConfigExporter(serialisationChecker);
    });

    describe('exportLibrary()', () => {
        it('should be able to fetch the merged config for a library', () => {
            const configShape = exporter.exportLibrary(
                rootConfig,
                'my_main_lib',
                'my_sub_lib'
            );

            expect(configShape).toEqual({
                libraryName: 'my_sub_lib',
                topLevelConfig: {
                    'first_setting': '[overridden] first value',
                    'second_setting': 'second value',
                },
                pluginConfigFilePaths: [],
            });
        });

        it('should not attempt to merge config when no sub-library is given', () => {
            const configShape = exporter.exportLibrary(
                rootConfig,
                'my_sub_lib'
            );

            expect(configShape).toEqual({
                libraryName: 'my_sub_lib',
                topLevelConfig: {
                    'first_setting': 'first value',
                    'second_setting': 'second value',
                },
                pluginConfigFilePaths: [],
            });
        });

        it("should just extract an empty topLevelConfig object when no sub-library is given and the main library's config is undefined", () => {
            const configShape = exporter.exportLibrary(
                rootConfig,
                'an_invalid_undefined_lib_config'
            );

            expect(configShape).toEqual({
                libraryName: 'an_invalid_undefined_lib_config',
                topLevelConfig: {},
                pluginConfigFilePaths: [],
            });
        });

        it("should just return the sub-library's config when a sub-library is given but the main library's config is undefined", () => {
            const configShape = exporter.exportLibrary(
                rootConfig,
                'an_invalid_undefined_lib_config',
                'my_sub_lib'
            );

            expect(configShape).toEqual({
                libraryName: 'my_sub_lib',
                topLevelConfig: {
                    'first_setting': 'first value',
                    'second_setting': 'second value',
                },
                pluginConfigFilePaths: [],
            });
        });

        it('should just return an empty topLevelConfig object when a sub-library is given but its config is undefined', () => {
            const configShape = exporter.exportLibrary(
                rootConfig,
                'my_main_lib',
                'an_invalid_undefined_sub_lib'
            );

            expect(configShape).toEqual({
                libraryName: 'an_invalid_undefined_sub_lib',
                topLevelConfig: {},
                pluginConfigFilePaths: [],
            });
        });

        it('should fetch the shape including plugins using the simple syntax', () => {
            rootConfig = {
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
            };

            const configShape = exporter.exportLibrary(
                rootConfig,
                'my_main_lib',
                'my_sub_lib'
            );

            expect(configShape).toEqual({
                libraryName: 'my_sub_lib',
                topLevelConfig: {
                    'first_setting': '[overridden] first value',
                    'second_setting': 'second value',
                },
                pluginConfigFilePaths: [
                    '/path/to/my/first_sub_lib_config',
                    '/path/to/my/second_sub_lib_config',
                ],
            });
        });

        it('should fetch the shape including plugins using the extended syntax', () => {
            rootConfig = {
                'plugins': [
                    {
                        'my_main_lib': {
                            'my_main_lib': '/path/to/my/main_lib_config',
                        },
                    },
                    {
                        'my_main_lib': {
                            'my_sub_lib': '/path/to/my/first_sub_lib_config',
                        },
                    },
                    {
                        'my_main_lib': {
                            'my_sub_lib': '/path/to/my/second_sub_lib_config',
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
            };

            expect(exporter.exportLibrary(rootConfig, 'my_main_lib')).toEqual({
                libraryName: 'my_main_lib',
                topLevelConfig: {
                    // NB: See note above about why this is included here
                    'my_sub_lib': {
                        'first_setting': '[overridden] first value',
                    },
                },
                pluginConfigFilePaths: ['/path/to/my/main_lib_config'],
            });
            expect(
                exporter.exportLibrary(rootConfig, 'my_main_lib', 'my_sub_lib')
            ).toEqual({
                libraryName: 'my_sub_lib',
                topLevelConfig: {
                    'first_setting': '[overridden] first value',
                    'second_setting': 'second value',
                },
                pluginConfigFilePaths: [
                    '/path/to/my/first_sub_lib_config',
                    '/path/to/my/second_sub_lib_config',
                ],
            });
        });

        it("should throw when the main library's simple config is not a string nor object", () => {
            rootConfig = {
                'plugins': [
                    {
                        'my_main_lib': 1234,
                    },
                ],
                'settings': {},
            } as never; // Use "never" type as the above config is (deliberately) partially invalid

            expect(() => {
                exporter.exportLibrary(rootConfig, 'my_main_lib');
            }).toThrow(
                'Value for main library "my_main_lib" should be a path or object'
            );
        });

        it("should throw when fetching main library config and the main library's extended config is not a string nor object", () => {
            rootConfig = {
                'plugins': [
                    {
                        'my_main_lib': {
                            'my_main_lib': 1234,
                        },
                    },
                ],
                'settings': {},
            } as never; // Use "never" type as the above config is (deliberately) partially invalid

            expect(() => {
                exporter.exportLibrary(rootConfig, 'my_main_lib');
            }).toThrow(
                'Value for main library extended config path "my_main_lib.my_main_lib" should be a path'
            );
        });

        it("should throw when a sub-library's config (under main library's extended config) is not a string", () => {
            rootConfig = {
                'plugins': [
                    {
                        'my_main_lib': {
                            'my_sub_lib': 1234,
                        },
                    },
                ],
                'settings': {},
            } as never; // Use "never" type as the above config is (deliberately) partially invalid

            expect(() => {
                exporter.exportLibrary(rootConfig, 'my_main_lib', 'my_sub_lib');
            }).toThrow(
                'Value for sub-library under "my_main_lib.my_sub_lib" should be a path'
            );
        });

        it("should throw when fetching sub-library config and the main library's extended config is not a string nor object", () => {
            rootConfig = {
                'plugins': [
                    {
                        'my_main_lib': 4321,
                    },
                ],
                'settings': {},
            } as never; // Use "never" type as the above config is (deliberately) partially invalid

            expect(() => {
                exporter.exportLibrary(rootConfig, 'my_main_lib', 'my_sub_lib');
            }).toThrow(
                'Value for main library extended config path "my_main_lib.my_main_lib" should be a path or object'
            );
        });

        it('should throw when a plugin attempts to give isolated sub-library config inline rather than a path', () => {
            rootConfig = {
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
            };

            expect(() => {
                exporter.exportLibrary(rootConfig, 'my_main_lib', 'my_sub_lib');
            }).toThrow(
                'Isolated value for sub-library "my_sub_lib" should be a path'
            );
        });

        it("should throw when the main library's config is a boolean", () => {
            expect(() => {
                exporter.exportLibrary(
                    rootConfig,
                    'an_invalid_boolean_lib_config'
                );
            }).toThrow(
                'Config for main library "an_invalid_boolean_lib_config" should be an object'
            );
        });

        it("should ignore when the main library's config is null", () => {
            const configShape = exporter.exportLibrary(
                rootConfig,
                'a_null_lib_config'
            );

            expect(configShape.topLevelConfig).toEqual({});
        });

        it("should throw when the main library's config is a number", () => {
            expect(() => {
                exporter.exportLibrary(
                    rootConfig,
                    'an_invalid_number_lib_config'
                );
            }).toThrow(
                'Config for main library "an_invalid_number_lib_config" should be an object'
            );
        });

        it("should throw when the main library's config is a string", () => {
            expect(() => {
                exporter.exportLibrary(
                    rootConfig,
                    'an_invalid_string_lib_config'
                );
            }).toThrow(
                'Config for main library "an_invalid_string_lib_config" should be an object'
            );
        });

        it('should throw when the top-level config is not serialisable', () => {
            serialisationChecker.isSerialisable
                .withArgs({
                    'first_setting': '[overridden] first value',
                    'second_setting': 'second value',
                })
                .returns(false);

            expect(() => {
                exporter.exportLibrary(rootConfig, 'my_main_lib', 'my_sub_lib');
            }).toThrow(
                'Top-level config for library "my_sub_lib" is not serialisable'
            );
        });
    });
});
