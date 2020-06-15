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
import RequirerInterface from './RequirerInterface';

/**
 * A type predicate for determining at runtime whether a valid root config was given.
 *
 * @param {RootConfig | SubConfig} config
 * @returns {boolean}
 */
function isValidConfig(config: RootConfig | SubConfig): config is RootConfig {
    return Boolean(config.plugins || config.settings);
}

/**
 * Attempts to load a config file from the given list of search paths
 */
export default class ConfigLoader implements ConfigLoaderInterface {
    constructor(
        private requirer: RequirerInterface,
        private loader: LoaderInterface,
        private Config: new (
            requirer: RequirerInterface,
            allConfig: RootConfig
        ) => ConfigInterface
    ) {}

    /**
     * @inheritDoc
     */
    getConfig(searchPaths: string[]): ConfigInterface {
        const allConfig = this.loader.load(searchPaths);

        if (!isValidConfig(allConfig)) {
            throw new Error(
                'Given root config is invalid: must specify one of "plugins" or "settings" or both'
            );
        }

        return new this.Config(this.requirer, allConfig);
    }
}
