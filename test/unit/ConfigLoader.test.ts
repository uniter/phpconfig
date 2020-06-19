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
import RequirerInterface from '../../src/RequirerInterface';
import ConfigSet from '../../src/ConfigSet';

type StubConfigClassType = sinon.SinonStub &
    (new (
        requirer: RequirerInterface,
        allConfig: RootConfig
    ) => ConfigInterface);

describe('ConfigLoader', () => {
    let configLoader: ConfigLoader;
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

        loader = stubInterface<LoaderInterface>();

        requirer = stubInterface<RequirerInterface>();

        configLoader = new ConfigLoader(
            requirer,
            loader,
            StubConfigClass,
            ConfigSet
        );
    });

    describe('getConfigsForLibrary()', () => {
        it('should be able to fetch the config for a library with settings config', () => {
            loader.load.withArgs(['/first/path']).returns({
                'settings': {
                    'my_lib': { my: 'config' },
                },
            });

            const config = configLoader.getConfig(['/first/path']);

            expect(config.getConfigsForLibrary('my_lib').toArray()).toEqual([
                {
                    my: 'config',
                },
            ]);
        });

        it('should be able to fetch the config for a library with plugin config', () => {
            loader.load.withArgs(['/first/path']).returns({
                'plugins': [
                    { 'my_first_lib': '/path/to/first_lib_config' },
                    { 'my_second_lib': '/path/to/second_lib_config' },
                ],
            });

            const config = configLoader.getConfig(['/first/path']);

            expect(config.getConfigsForLibrary('my_lib').toArray()).toEqual([
                {
                    my: 'fake plugin-derived config',
                },
            ]);
        });

        it('should be able to fetch the config for a library with both plugin and settings configs', () => {
            loader.load.withArgs(['/first/path']).returns({
                'plugins': [
                    { 'my_first_lib': '/path/to/first_lib_config' },
                    { 'my_second_lib': '/path/to/second_lib_config' },
                ],
                'settings': {
                    'my_lib': { my: 'config' },
                },
            });

            const config = configLoader.getConfig(['/first/path']);

            expect(config.getConfigsForLibrary('my_lib').toArray()).toEqual([
                {
                    my: 'config',
                },
            ]);
        });

        it('should allow an empty config', () => {
            loader.load.withArgs(['/first/path']).returns({});

            const config = configLoader.getConfig(['/first/path']);

            expect(config.getConfigsForLibrary('my_lib').toArray()).toEqual([
                {
                    'my': 'fake plugin-derived config',
                },
            ]);
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
