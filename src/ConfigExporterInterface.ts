/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

/**
 * Exports the config for a specific main- or sub-library
 * to a structure with the (serialisable) root config and the paths
 * to any additional config set modules from plugins.
 *
 * If the root config for the library is not serialisable,
 * then an error will be raised.
 */
export default interface ConfigExporterInterface {
    /**
     * Extracts the config for the specified main- or sub-library,
     * in a structure where any relevant modules from plugins are kept
     * in path form so that they may be compiled into a JS bundle
     *
     * @param {RootConfig} rootConfig
     * @param {string} mainLibraryName
     * @param {string} subLibraryName
     * @returns {LibraryConfigShape}
     */
    exportLibrary(
        rootConfig: RootConfig,
        mainLibraryName: string,
        subLibraryName?: string
    ): LibraryConfigShape;
}
