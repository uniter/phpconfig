/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

type ConfigData = {
    [libraryOrSettingName: string]: SettingValue;
};

type SettingValue = ConfigData | boolean | null | number | string | undefined;
