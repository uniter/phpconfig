/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';
import Config from '../../src/Config';
import ConfigExporterInterface from '../../src/ConfigExporterInterface';
import ConfigInterface from '../../src/ConfigInterface';
import ConfigLoader from '../../src/ConfigLoader';
import ConfigSet from '../../src/ConfigSet';
import LoaderInterface from '../../src/LoaderInterface';
import RequirerInterface from '../../src/RequirerInterface';

type StubConfigClassType = sinon.SinonStub & typeof Config;

describe('ConfigLoader', () => {
    let configLoader: ConfigLoader;
    let exporter: StubbedInstance<ConfigExporterInterface>;
    let loader: StubbedInstance<LoaderInterface>;
    let requirer: StubbedInstance<RequirerInterface>;
    let StubConfigClass: StubConfigClassType;

    beforeEach(() => {
        StubConfigClass = sinon.stub() as StubConfigClassType;
        StubConfigClass.callsFake(
            (
                requirer: RequirerInterface,
                allConfig: RootConfig
            ): ConfigInterface => {
                const config: StubbedInstance<Config> = stubInterface<Config>();

                config.getConfigsForLibrary.callsFake(
                    (libraryName: string): ConfigSet => {
                        return new ConfigSet([
                            (allConfig.settings ?? {
                                [libraryName]: {
                                    'my': 'fake plugin-derived config',
                                },
                            })[libraryName] as SubConfig,
                        ]);
                    }
                );

                return config;
            }
        );

        exporter = stubInterface<ConfigExporterInterface>();
        loader = stubInterface<LoaderInterface>();
        requirer = stubInterface<RequirerInterface>();

        configLoader = new ConfigLoader(
            requirer,
            loader,
            exporter,
            StubConfigClass,
            ConfigSet
        );
    });

    describe('getConfig()', () => {
        it('should be able to fetch the config for a library', () => {
            const config = stubInterface<ConfigInterface>();
            StubConfigClass.withArgs(
                sinon.match.same(requirer),
                sinon.match.same(exporter),
                {
                    'settings': {
                        'my_lib': { my: 'config' },
                    },
                },
                sinon.match.same(ConfigSet)
            ).returns(config);
            loader.load.withArgs(['/first/path']).returns({
                'settings': {
                    'my_lib': { my: 'config' },
                },
            });

            // NB: We cannot use expect(result).toStrictEqual(config) here,
            //     because of the strange way Jest recursively attempts to match for a strict equality -
            //     Sinon stubs the [Symbol.iterator] method, so that it then returns undefined,
            //     which causes `TypeError: Result of the Symbol.iterator method is not an object`
            //     to be raised in the for..of loop of expect/build/utils.js::iterableEquality()
            expect(configLoader.getConfig(['/first/path']) === config).toEqual(
                true
            );
        });

        it('should throw when the given config is invalid', () => {
            loader.load.withArgs(['/first/path']).returns({
                // Specify neither "settings" nor "plugins" -
                // one (or both) must be specified
                'this is': 'not valid',
            });

            expect(() => {
                configLoader.getConfig(['/first/path']);
            }).toThrow(
                'Given root config is invalid: may only specify "plugins" or "settings" or both'
            );
        });
    });
});
