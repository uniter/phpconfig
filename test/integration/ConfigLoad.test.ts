/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { configLoader } from '../..';

describe('Config load integration', () => {
    it('should load the first matching file that exists', () => {
        const configSet = configLoader
            .getConfig([
                __dirname + '/fixtures/non_existent/',
                __dirname + '/fixtures/first_dir',
                // File also exists here, but the one above should take precedence
                __dirname + '/fixtures/second_dir',
            ])
            .getConfigsForLibrary('my_lib');

        expect(configSet.toArray()).toEqual([
            {
                'my_setting': 'my value',
            },
        ]);
    });

    it('should support loading plugins', () => {
        const config = configLoader.getConfig([
                __dirname + '/fixtures/plugin_test',
            ]),
            mainLibConfigSet = config.getConfigsForLibrary('my_main_lib'),
            parserLibConfigSet = config.getConfigsForLibrary(
                'my_main_lib',
                'my_parser_lib'
            ),
            transpilerLibConfigSet = config.getConfigsForLibrary(
                'my_transpiler_lib'
            );

        expect(mainLibConfigSet.toArray()).toEqual([
            {
                'my_parser_lib': {
                    'my_non_parser_lib_setting':
                        'I should not be treated as config for the parser sub-lib',
                },
                'some_setting_for_main_lib': 'my value for main lib',
            },
            {
                'my_parser_lib': {
                    'my_parser_setting_from_root_1':
                        'my custom value from root for sub-library under main library',
                },
            },
        ]);
        expect(parserLibConfigSet.toArray()).toEqual([
            { 'my_parser_setting': 'my first value from combined plugin' },
            { 'my_parser_setting': 'my value from plugin 1' },
            {
                'my_other_parser_setting2': 'my second value from plugin 2',
            },
            {
                'my_other_parser_setting1': 'my first value from plugin 2',
            },
            {
                'my_parser_setting_from_root_1':
                    'my custom value from root for sub-library under main library',
                'my_parser_setting_from_root_2':
                    'my custom value from root for sub-library',
            },
        ]);
        expect(transpilerLibConfigSet.toArray()).toEqual([
            { 'my_transpiler_setting': 'my second value from combined plugin' },
            {
                'my_transpiler_setting':
                    'my value from the only transpiler-specific plugin',
            },
        ]);
    });
});
