/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import Config from '../../src/Config';
import { existsSync } from 'fs';
import Loader from '../../src/Loader';
import ConfigLoader from '../../src/ConfigLoader';
import Requirer from '../../src/Requirer';

describe('Config load integration', () => {
    let configLoader: ConfigLoader;
    let loader: Loader;
    let requirer: Requirer;

    beforeEach(() => {
        requirer = new Requirer(require);
        loader = new Loader(existsSync, requirer, 'test.uniter.config.js');
        configLoader = new ConfigLoader(requirer, loader, Config);
    });

    it('should load the first matching file that exists', () => {
        const data = configLoader
            .getConfig([
                __dirname + '/fixtures/non_existent/',
                __dirname + '/fixtures/first_dir',
                // File also exists here, but the one above should take precedence
                __dirname + '/fixtures/second_dir',
            ])
            .getConfigsForLibrary('my_lib');

        expect(data).toEqual([
            {
                'my_setting': 'my value',
            },
        ]);
    });

    it('should support loading plugins', () => {
        const config = configLoader.getConfig([
                __dirname + '/fixtures/plugin_test',
            ]),
            parserLibConfig = config.getConfigsForLibrary(
                'my_main_lib',
                'my_parser_lib'
            ),
            transpilerLibConfig = config.getConfigsForLibrary(
                'my_transpiler_lib'
            );

        expect(parserLibConfig).toEqual([
            { 'my_parser_setting': 'my first value from combined plugin' },
            { 'my_parser_setting': 'my value from plugin 1' },
            {
                'my_other_parser_setting1': 'my first value from plugin 2',
                'my_other_parser_setting2': 'my second value from plugin 2',
            },
            { 'my_parser_setting': 'my custom value' },
        ]);
        expect(transpilerLibConfig).toEqual([
            { 'my_transpiler_setting': 'my second value from combined plugin' },
            {
                'my_transpiler_setting':
                    'my value from the only transpiler-specific plugin',
            },
        ]);
    });
});
