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
import ConfigExporterInterface from '../../src/ConfigExporterInterface';

describe('Config', () => {
    let config: Config;
    let exporter: StubbedInstance<ConfigExporterInterface>;
    let requirer: StubbedInstance<RequirerInterface>;
    let rootConfig: RootConfig;

    beforeEach(() => {
        exporter = stubInterface<ConfigExporterInterface>();
        requirer = stubInterface<RequirerInterface>();
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
                'an_invalid_null_lib_config': null,
                'an_invalid_number_lib_config': 1234,
                'an_invalid_string_lib_config': 'my string',
                'an_invalid_undefined_lib_config': undefined,
            },
        } as never; // Use "never" type as the above config is (deliberately) partially invalid

        config = new Config(requirer, exporter, rootConfig, ConfigSet);
    });

    describe('exportLibrary()', () => {
        it('should return the result of exporting the config via the ConfigExporter', () => {
            exporter.exportLibrary
                .withArgs(rootConfig, 'my_main_lib', 'my_sub_lib')
                .returns({
                    libraryName: 'my_sub_lib',
                    topLevelConfig: {
                        'my_setting': 21,
                    },
                    pluginConfigFilePaths: [
                        '/my/first/plugin/path',
                        '/my/second/plugin/path',
                    ],
                });

            expect(config.exportLibrary('my_main_lib', 'my_sub_lib')).toEqual({
                libraryName: 'my_sub_lib',
                topLevelConfig: {
                    'my_setting': 21,
                },
                pluginConfigFilePaths: [
                    '/my/first/plugin/path',
                    '/my/second/plugin/path',
                ],
            });
        });
    });

    describe('getConfigsForLibrary()', () => {
        it('should be able to fetch the ConfigSet for a library when there are no plugins', () => {
            exporter.exportLibrary
                .withArgs(rootConfig, 'my_main_lib', 'my_sub_lib')
                .returns({
                    libraryName: 'my_sub_lib',
                    topLevelConfig: {
                        'my_first_setting': 21,
                        'my_second_setting': 456,
                    },
                    pluginConfigFilePaths: [],
                });

            const configSet = config.getConfigsForLibrary(
                'my_main_lib',
                'my_sub_lib'
            );

            expect(configSet.toArray()).toEqual([
                {
                    'my_first_setting': 21,
                    'my_second_setting': 456,
                },
            ]);
        });

        it('should be able to fetch the ConfigSet for a library when there are plugins', () => {
            exporter.exportLibrary
                .withArgs(rootConfig, 'my_main_lib', 'my_sub_lib')
                .returns({
                    libraryName: 'my_sub_lib',
                    topLevelConfig: {
                        'my_first_setting': 21,
                        'my_second_setting': 456,
                    },
                    pluginConfigFilePaths: [
                        '/my/first/sub_lib_plugin_path',
                        '/my/second/sub_lib_plugin_path',
                    ],
                });
            requirer.require.withArgs('/my/first/sub_lib_plugin_path').returns({
                'my_third_setting': 101,
            });
            requirer.require
                .withArgs('/my/second/sub_lib_plugin_path')
                .returns({
                    'my_fourth_setting': 9876,
                });

            const configSet = config.getConfigsForLibrary(
                'my_main_lib',
                'my_sub_lib'
            );

            expect(configSet.toArray()).toEqual([
                {
                    'my_third_setting': 101,
                },
                {
                    'my_fourth_setting': 9876,
                },
                {
                    'my_first_setting': 21,
                    'my_second_setting': 456,
                },
            ]);
        });

        it('should not include the top-level config for the library when it is empty', () => {
            exporter.exportLibrary
                .withArgs(rootConfig, 'my_main_lib', 'my_sub_lib')
                .returns({
                    libraryName: 'my_sub_lib',
                    topLevelConfig: {},
                    pluginConfigFilePaths: ['/my/sub_lib_plugin_path'],
                });
            requirer.require.withArgs('/my/sub_lib_plugin_path').returns({
                'my_setting': 101,
            });

            const configSet = config.getConfigsForLibrary(
                'my_main_lib',
                'my_sub_lib'
            );

            expect(configSet.toArray()).toEqual([
                {
                    'my_setting': 101,
                },
            ]);
        });

        it("should throw when a plugin's imported main-library config is not an object", () => {
            exporter.exportLibrary.withArgs(rootConfig, 'my_main_lib').returns({
                libraryName: 'my_main_lib',
                topLevelConfig: {},
                pluginConfigFilePaths: ['/my/main_lib_plugin_path'],
            });
            requirer.require.withArgs('/my/main_lib_plugin_path').returns(
                // Use "never" type as this config is (deliberately) invalid
                1234 as never
            );

            expect(() => {
                config.getConfigsForLibrary('my_main_lib');
            }).toThrow(
                'Imported config for main library "my_main_lib" should be an object'
            );
        });

        it("should throw when a plugin's imported sub-library config is not an object", () => {
            exporter.exportLibrary
                .withArgs(rootConfig, 'my_main_lib', 'my_sub_lib')
                .returns({
                    libraryName: 'my_sub_lib',
                    topLevelConfig: {},
                    pluginConfigFilePaths: ['/my/sub_lib_plugin_path'],
                });
            requirer.require.withArgs('/my/sub_lib_plugin_path').returns(
                // Use "never" type as this config is (deliberately) invalid
                1234 as never
            );

            expect(() => {
                config.getConfigsForLibrary('my_main_lib', 'my_sub_lib');
            }).toThrow(
                'Imported config for sub-library "my_sub_lib" under main library "my_main_lib" should be an object'
            );
        });
    });
});
