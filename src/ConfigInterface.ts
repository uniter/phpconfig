/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import ConfigSetInterface from './ConfigSetInterface';

/**
 * Contains an entire loaded config, potentially containing the configuration
 * for multiple libraries inside
 */
export default interface ConfigInterface {
    /**
     * Extracts the config for the specified main- or sub-library,
     * in a structure where any relevant modules from plugins are kept
     * in path form so that they may be compiled into a JS bundle
     *
     * @param {string} mainLibraryName
     * @param {string} subLibraryName
     * @returns {LibraryConfigShape}
     */
    exportLibrary(
        mainLibraryName: string,
        subLibraryName?: string,
    ): LibraryConfigShape;

    /**
     * Fetches the config for the given library within the given search paths
     *
     * @param {string} mainLibraryName
     * @param {string=} subLibraryName
     * @returns {ConfigSetInterface}
     */
    getConfigsForLibrary(
        mainLibraryName: string,
        subLibraryName?: string,
    ): ConfigSetInterface;
}
