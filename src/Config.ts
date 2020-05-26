/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import ConfigInterface from './ConfigInterface';

/**
 * Contains an entire loaded config, potentially containing the configuration
 * for multiple libraries inside
 */
export default class Config implements ConfigInterface {
    constructor(private allConfig: ConfigData) {}

    /**
     * @inheritDoc
     */
    getConfigForLibrary(
        mainLibraryName: string,
        subLibraryName?: string
    ): SettingValue {
        let mainConfig: SettingValue = this.allConfig[mainLibraryName];

        if (mainConfig === null) {
            throw new Error(
                `Config for main library "${mainLibraryName}" should not be null`
            );
        }

        if (typeof mainConfig === 'undefined') {
            mainConfig = {};
        }

        if (typeof mainConfig !== 'object') {
            throw new Error(
                `Config for main library "${mainLibraryName}" should be an object`
            );
        }

        if (subLibraryName == null) {
            return mainConfig;
        }

        const subConfig = this.allConfig[subLibraryName] ?? {};

        // Config for the sub-library that is specified under the main library
        // should override settings for the sub-library that are set outside
        return Object.assign({}, subConfig, mainConfig[subLibraryName]);
    }
}
