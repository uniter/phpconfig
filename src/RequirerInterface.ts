/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

export default interface RequirerInterface {
    /**
     * Requires the given file containing config
     *
     * @param {string} path
     * @returns {RootConfig|SubConfig}
     */
    require(path: string): RootConfig | SubConfig;
}
