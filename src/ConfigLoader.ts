/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import ConfigInterface from './ConfigInterface';
import LoaderInterface from './LoaderInterface';
import ConfigLoaderInterface from './ConfigLoaderInterface';

/**
 * Attempts to load a config file from the given list of search paths
 */
export default class ConfigLoader implements ConfigLoaderInterface {
    constructor(
        private loader: LoaderInterface,
        private Config: new (allConfig: ConfigData) => ConfigInterface
    ) {}

    /**
     * @inheritDoc
     */
    getConfig(searchPaths: string[]): ConfigInterface {
        const allConfig = this.loader.load(searchPaths);

        return new this.Config(allConfig as ConfigData);
    }
}
