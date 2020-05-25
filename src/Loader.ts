/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { join } from 'path';
import LoaderInterface from './LoaderInterface';

/**
 * Attempts to load a configuration file from one or more potential directories,
 * stopping at the first one where a file with the given name is found
 */
export default class Loader implements LoaderInterface {
    constructor(
        private existsSync: (path: string) => boolean,
        private require: Function,
        private fileName: string
    ) {}

    /**
     * @inheritDoc
     */
    load(searchDirectories: string[]): { [libraryName: string]: object } {
        for (const searchDirectory of searchDirectories) {
            const searchPath = join(searchDirectory, this.fileName);

            if (this.existsSync(searchPath)) {
                return this.require(searchPath);
            }
        }

        throw new Error(
            `File "${
                this.fileName
            }" was not found at any of the given search paths: ${searchDirectories.join(
                ', '
            )}`
        );
    }
}
