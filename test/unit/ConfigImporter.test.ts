/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import sinon, { stubInterface } from 'ts-sinon';
import ConfigImporter from '../../src/ConfigImporter';
import ConfigSet from '../../src/ConfigSet';
import ConfigSetInterface from '../../src/ConfigSetInterface';

type StubConfigSetClassType = sinon.SinonStub & typeof ConfigSet;

describe('ConfigImporter', () => {
    let configImporter: ConfigImporter;
    let StubConfigSetClass: StubConfigSetClassType;

    beforeEach(() => {
        StubConfigSetClass = sinon.stub() as StubConfigSetClassType;

        configImporter = new ConfigImporter(StubConfigSetClass);
    });

    describe('importLibrary()', () => {
        it('should be able to import the config set for a library', () => {
            const configSet = stubInterface<ConfigSetInterface>();
            StubConfigSetClass.withArgs([
                {
                    'my_setting': 21,
                },
            ]).returns(configSet);

            expect(
                configImporter.importLibrary({
                    libraryName: 'my_lib',
                    configs: [
                        {
                            'my_setting': 21,
                        },
                    ],
                }),
            ).to.equal(configSet);
        });
    });
});
