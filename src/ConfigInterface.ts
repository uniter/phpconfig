/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

/**
 * Contains an entire loaded config, potentially containing the configuration
 * for multiple libraries inside
 */
export default interface ConfigInterface {
    /**
     * Fetches the config for the given library within the given search paths
     *
     * @param {string} mainLibraryName
     * @param {string=} subLibraryName
     * @returns {SubConfig[]}
     */
    getConfigsForLibrary(
        mainLibraryName: string,
        subLibraryName?: string
    ): SubConfig[];
}
