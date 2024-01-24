/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { configImporter } from '../..';
import { expect } from 'chai';

describe('Config import integration', () => {
    it('should import the config for the specified sub-library', () => {
        const importedLibraryConfigSet = configImporter.importLibrary({
            libraryName: 'my_lib',
            configs: [
                {
                    'my_object_setting': { 'my_first_prop': 'my first value' },
                    'my_other_setting': 1234,
                },
                {
                    'my_object_setting': {
                        'my_second_prop': 'my second value',
                    },
                },
            ],
        });

        expect(
            importedLibraryConfigSet.mergeObjects('my_object_setting'),
        ).to.deep.equal({
            'my_first_prop': 'my first value',
            'my_second_prop': 'my second value',
        });
    });
});
