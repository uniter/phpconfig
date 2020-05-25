/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import LoaderInterface from '../../src/LoaderInterface';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';
import ConfigLoader from '../../src/ConfigLoader';
import ConfigInterface from '../../src/ConfigInterface';
import Config from '../../src/Config';

type StubConfigClassType = sinon.SinonStub &
    (new (allConfig: ConfigData) => ConfigInterface);

describe('ConfigLoader', () => {
    let StubConfigClass: StubConfigClassType;
    let configLoader: ConfigLoader;
    let loader: StubbedInstance<LoaderInterface>;

    beforeEach(() => {
        StubConfigClass = sinon.stub() as StubConfigClassType;
        StubConfigClass.callsFake((allConfig: ConfigData) => {
            const config: StubbedInstance<Config> = stubInterface(
                StubConfigClass
            );

            config.getConfigForLibrary.callsFake(
                (libraryName: string): SettingValue => {
                    return allConfig[libraryName];
                }
            );

            return config;
        });

        loader = stubInterface<LoaderInterface>();
        loader.load
            .withArgs(['/first/path'])
            .returns({ 'my_lib': { my: 'config' } });

        configLoader = new ConfigLoader(loader, StubConfigClass);
    });

    describe('getConfigForLibrary()', () => {
        it('should be able to fetch the config for a library', () => {
            const config = configLoader.getConfig(['/first/path']);

            expect(config.getConfigForLibrary('my_lib')).toEqual({
                my: 'config',
            });
        });
    });
});
