/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import ConfigInterface from './ConfigInterface';
import RequirerInterface from './RequirerInterface';

/**
 * Fetches the config for the given library from the root config
 *
 * @param {RootConfig} allConfig
 * @param {string} mainLibraryName
 * @param {string=} subLibraryName
 * @returns {SubConfig}
 */
function getLibraryConfigFromRoot(
    allConfig: RootConfig,
    mainLibraryName: string,
    subLibraryName?: string
): SubConfig {
    const mainConfig: string | SubConfig =
        (allConfig.settings ?? {})[mainLibraryName] ?? {};

    if (typeof mainConfig !== 'object') {
        throw new Error(
            `Config for main library "${mainLibraryName}" should be an object`
        );
    }

    if (subLibraryName == null) {
        return mainConfig;
    }

    let subConfig: SubConfig =
        (allConfig.settings ?? {})[subLibraryName] ?? null;

    if (subConfig === null) {
        subConfig = {};
    }

    // Config for the sub-library that is specified under the main library
    // should override settings for the sub-library that are set outside
    return Object.assign(
        {},
        subConfig,
        mainConfig[subLibraryName]
    ) as SubConfig;
}

/**
 * Fetches the config for the given library from a plugin config
 *
 * @param {RequirerInterface} requirer
 * @param {PluginConfig} pluginConfig
 * @param {string} mainLibraryName
 * @param {string=} subLibraryName
 * @returns {SubConfig}
 */
function getLibraryConfigFromPlugin(
    requirer: RequirerInterface,
    pluginConfig: PluginConfig,
    mainLibraryName: string,
    subLibraryName?: string
): SubConfig {
    let mainConfig: null | string | SubConfig =
        pluginConfig[mainLibraryName] ?? null;

    if (mainConfig === null) {
        mainConfig = {};
    } else if (requirer) {
        if (typeof mainConfig !== 'string') {
            throw new Error(
                `Value for main library "${mainLibraryName}" should be a path`
            );
        }

        mainConfig = requirer.require(mainConfig);
    }

    if (typeof mainConfig !== 'object') {
        throw new Error(
            `Config for main library "${mainLibraryName}" should be an object`
        );
    }

    if (subLibraryName == null) {
        return mainConfig;
    }

    let subConfig: null | string | SubConfig =
        pluginConfig[subLibraryName] ?? null;

    if (subConfig === null) {
        subConfig = {};
    } else if (requirer) {
        if (typeof subConfig !== 'string') {
            throw new Error(
                `Value for sub-library "${subLibraryName}" should be a path`
            );
        }

        subConfig = requirer.require(subConfig);
    }

    // Config for the sub-library that is specified under the main library
    // should override settings for the sub-library that are set outside
    return Object.assign(
        {},
        subConfig,
        mainConfig[subLibraryName]
    ) as SubConfig;
}

function isEmpty(subConfig: SubConfig): boolean {
    return Object.keys(subConfig).length === 0;
}

/**
 * Contains an entire loaded config, potentially containing the configuration
 * for multiple libraries inside
 */
export default class Config implements ConfigInterface {
    constructor(
        private requirer: RequirerInterface,
        private allConfig: RootConfig
    ) {}

    /**
     * @inheritDoc
     */
    getConfigsForLibrary(
        mainLibraryName: string,
        subLibraryName?: string
    ): SubConfig[] {
        const configs = [];

        if (this.allConfig.plugins) {
            for (const pluginSubLibraryConfigs of this.allConfig.plugins) {
                const pluginSubLibraryConfig = getLibraryConfigFromPlugin(
                    this.requirer,
                    pluginSubLibraryConfigs,
                    mainLibraryName,
                    subLibraryName
                );

                if (!isEmpty(pluginSubLibraryConfig)) {
                    configs.push(pluginSubLibraryConfig);
                }
            }
        }

        const topLevelConfig = getLibraryConfigFromRoot(
            this.allConfig,
            mainLibraryName,
            subLibraryName
        );

        if (!isEmpty(topLevelConfig)) {
            configs.push(topLevelConfig);
        }

        return configs;
    }
}
