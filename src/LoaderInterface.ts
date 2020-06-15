/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

/**
 * Attempts to load a configuration file from one or more potential directories,
 * stopping at the first one where a file with the given name is found
 */
export default interface LoaderInterface {
    /**
     * Attempts to load the file at one of the given search directories, in sequence.
     *
     * @param {string[]} searchDirectories
     * @returns {RootConfig|SubConfig}
     * @throws {Error} Throws when file was not found at any of the given search directory paths
     */
    load(searchDirectories: string[]): RootConfig | SubConfig;
}
