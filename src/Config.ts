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
import ConfigSetInterface from './ConfigSetInterface';

const hasOwn = {}.hasOwnProperty;

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
 * Fetches the config for the given main library from a plugin config
 *
 * @param {RequirerInterface} requirer
 * @param {PluginConfig} pluginConfig
 * @param {string} mainLibraryName
 * @returns {SubConfig}
 */
function getMainLibraryConfigFromPlugin(
    requirer: RequirerInterface,
    pluginConfig: PluginConfig,
    mainLibraryName: string
): SubConfig {
    let mainConfig: null | string | SubConfig =
        pluginConfig[mainLibraryName] ?? null;

    if (mainConfig === null) {
        // No config is specified for the main library by this plugin
        return {};
    }

    if (typeof mainConfig === 'string') {
        // Main config is provided via the simple path-string syntax;
        // the main library config should be required from the given path
        mainConfig = requirer.require(mainConfig);
    } else if (typeof mainConfig === 'object') {
        // Main config is provided via the extended object syntax;
        // the main library config (if given) should be required from the path
        // given as a property of this object with the main library's name
        const pathToMainConfig = mainConfig[mainLibraryName] ?? null;

        if (pathToMainConfig === null) {
            // Main library's extended syntax does not specify anything for itself
            return {};
        }

        if (typeof pathToMainConfig !== 'string') {
            throw new Error(
                `Value for main library extended config path "${mainLibraryName}.${mainLibraryName}" should be a path or object`
            );
        }

        mainConfig = requirer.require(pathToMainConfig);
    } else {
        throw new Error(
            `Value for main library "${mainLibraryName}" should be a path or object`
        );
    }

    if (typeof mainConfig !== 'object') {
        throw new Error(
            `Config for main library "${mainLibraryName}" should be an object`
        );
    }

    return mainConfig;
}

/**
 * Fetches the config for the given sub-library from a plugin config
 *
 * @param {RequirerInterface} requirer
 * @param {PluginConfig} pluginConfig
 * @param {string} mainLibraryName
 * @param {string} subLibraryName
 * @returns {SubConfig}
 */
function getSubLibraryConfigFromPlugin(
    requirer: RequirerInterface,
    pluginConfig: PluginConfig,
    mainLibraryName: string,
    subLibraryName: string
): SubConfig {
    const isolatedPathToSubLibraryConfig: string | SubLibraryConfig | null =
        pluginConfig[subLibraryName] ?? null;
    let isolatedSubLibraryConfig: SubConfig | null = null;
    let subLibraryConfigUnderMain: SubConfig | null = null;
    const mainLibraryConfig = pluginConfig[mainLibraryName] ?? {};

    if (hasOwn.call(pluginConfig, subLibraryName)) {
        if (typeof isolatedPathToSubLibraryConfig !== 'string') {
            throw new Error(
                `Isolated value for sub-library "${subLibraryName}" should be a path`
            );
        }

        isolatedSubLibraryConfig =
            requirer.require(isolatedPathToSubLibraryConfig) ?? {};

        if (typeof isolatedSubLibraryConfig !== 'object') {
            throw new Error(
                `Imported config for sub-library "${subLibraryName}" should be an object`
            );
        }
    }

    if (typeof mainLibraryConfig === 'object') {
        // Main config is provided via the extended object syntax;
        // the sub-library config (if given) should be required from the path
        // given as a property of this object with the sub-library's name
        if (hasOwn.call(mainLibraryConfig, subLibraryName)) {
            if (typeof mainLibraryConfig[subLibraryName] !== 'string') {
                throw new Error(
                    `Value for sub-library under "${mainLibraryName}.${subLibraryName}" should be a path`
                );
            }

            const pathToSubLibraryConfigUnderMain = mainLibraryConfig[
                subLibraryName
            ] as string;

            subLibraryConfigUnderMain =
                requirer.require(pathToSubLibraryConfigUnderMain) ?? {};

            if (typeof subLibraryConfigUnderMain !== 'object') {
                throw new Error(
                    `Imported config for sub-library "${subLibraryName}" under main library "${mainLibraryName}" should be an object`
                );
            }
        }
    } else if (typeof mainLibraryConfig !== 'string') {
        throw new Error(
            `Value for main library extended config path "${mainLibraryName}.${mainLibraryName}" should be a path or object`
        );
    }

    return Object.assign(
        {},
        isolatedSubLibraryConfig,
        // Sub-library config given under main should take precedence,
        // so that defaults may be specified in the "isolated" config
        // and then overridden here
        subLibraryConfigUnderMain
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
    return subLibraryName
        ? getSubLibraryConfigFromPlugin(
              requirer,
              pluginConfig,
              mainLibraryName,
              subLibraryName
          )
        : getMainLibraryConfigFromPlugin(
              requirer,
              pluginConfig,
              mainLibraryName
          );
}

function isEmpty(subConfig: SubConfig): boolean {
    return Object.keys(subConfig).length === 0;
}

/**
 * @inheritDoc
 */
export default class Config implements ConfigInterface {
    constructor(
        private requirer: RequirerInterface,
        private allConfig: RootConfig,
        private ConfigSet: new (configs: SubConfig[]) => ConfigSetInterface
    ) {}

    /**
     * @inheritDoc
     */
    getConfigsForLibrary(
        mainLibraryName: string,
        subLibraryName?: string
    ): ConfigSetInterface {
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

        return new this.ConfigSet(configs);
    }
}
