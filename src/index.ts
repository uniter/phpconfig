/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { existsSync } from 'fs';
import Loader from './Loader';
import ConfigLoader from './ConfigLoader';
import Config from './Config';

export default new ConfigLoader(
    new Loader(existsSync, require, 'uniter.config.js'),
    Config
);
