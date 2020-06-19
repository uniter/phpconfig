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
import ConfigSetInterface from './ConfigSetInterface';

/**
 * A type predicate for determining at runtime whether a valid root config was given.
 *
 * @param {RootConfig | SubConfig} config
 * @returns {boolean}
 */
function isValidConfig(config: RootConfig | SubConfig): config is RootConfig {
    return (
        Object.keys(config).filter((settingName: string) => {
            // Only the keys "plugins" and/or "settings" are allowed
            return settingName !== 'plugins' && settingName !== 'settings';
        }).length === 0
    );
}

/**
 * @inheritDoc
 */
export default class ConfigLoader implements ConfigLoaderInterface {
    constructor(
        private requirer: RequirerInterface,
        private loader: LoaderInterface,
        private Config: new (
            requirer: RequirerInterface,
            allConfig: RootConfig,
            ConfigSet: new (configs: SubConfig[]) => ConfigSetInterface
        ) => ConfigInterface,
        private ConfigSet: new (configs: SubConfig[]) => ConfigSetInterface
    ) {}

    /**
     * @inheritDoc
     */
    getConfig(searchPaths: string[]): ConfigInterface {
        const allConfig = this.loader.load(searchPaths);

        if (!isValidConfig(allConfig)) {
            throw new Error(
                'Given root config is invalid: may only specify "plugins" or "settings" or both'
            );
        }

        return new this.Config(this.requirer, allConfig, this.ConfigSet);
    }
}
