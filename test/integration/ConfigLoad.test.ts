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

describe('Config load integration', () => {
    let configLoader: ConfigLoader;
    let loader: Loader;

    beforeEach(() => {
        loader = new Loader(existsSync, require, 'test.uniter.config.js');
        configLoader = new ConfigLoader(loader, Config);
    });

    it('should load the first matching file that exists', () => {
        const data = configLoader
            .getConfig([
                __dirname + '/fixtures/non_existent/',
                __dirname + '/fixtures/first_dir',
                // File also exists here, but the one above should take precedence
                __dirname + '/fixtures/second_dir',
            ])
            .getConfigForLibrary('my_lib');

        expect(data).toEqual({
            'my_option': 'my value',
        });
    });
});
