/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

type RootConfig =
    | {
          plugins?: PluginConfig[];
          settings: Settings;
      }
    | {
          plugins: PluginConfig[];
          settings?: Settings;
      };

type Settings = {
    [libraryName: string]: SubConfig;
};

type PluginConfig = {
    // Plugins should be specified in their own separate modules,
    // so the value should only ever be a path string if not nullish
    [libraryName: string]: null | string | undefined;
};

type SubConfig = {
    [propertyName: string]: SettingValue;
};

type SettingValue =
    | SettingValue[]
    | SubConfig
    | boolean
    | null
    | number
    | string
    | undefined;
