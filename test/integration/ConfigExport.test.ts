/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { createConfigLoader } from '../../src';
import { existsSync } from 'fs';
import { expect } from 'chai';
import ConfigLoaderInterface from '../../src/ConfigLoaderInterface';

describe('Config export integration', () => {
    let configLoader: ConfigLoaderInterface;

    beforeEach(() => {
        configLoader = createConfigLoader(existsSync);
    });

    it('should export the config for the specified sub-library', () => {
        const exportedLibraryConfig = configLoader
            .getConfig([__dirname + '/fixtures/plugin_test'])
            .exportLibrary('my_main_lib', 'my_parser_lib');

        expect(exportedLibraryConfig).to.deep.equal({
            libraryName: 'my_parser_lib',
            topLevelConfig: {
                'my_parser_setting_from_root_1':
                    'my custom value from root for sub-library under main library',
                'my_parser_setting_from_root_2':
                    'my custom value from root for sub-library',
            },
            pluginConfigFilePaths: [
                __dirname +
                    '/fixtures/plugin_test/plugins/my_combined_lib_plugin/config.parser',
                __dirname +
                    '/fixtures/plugin_test/plugins/my_parser_lib_plugin1/config.parser',
                __dirname +
                    '/fixtures/plugin_test/plugins/my_parser_lib_plugin2/config.parser',
                __dirname +
                    '/fixtures/plugin_test/plugins/my_parser_lib_plugin2/config.main_lib.parser',
            ],
        });
    });
});
