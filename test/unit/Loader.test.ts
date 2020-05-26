/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import { default as sinon } from 'ts-sinon';
import Loader from '../../src/Loader';

describe('Loader', () => {
    let existsSync: sinon.SinonStub & ((file: string) => boolean);
    let loader: Loader;
    let require: sinon.SinonStub & ((file: string) => unknown);

    describe('load()', () => {
        beforeEach(() => {
            existsSync = sinon.stub().returns(false);
            require = sinon.stub();

            loader = new Loader(existsSync, require, 'my.file.ext');
        });

        it('should require and return the module exports when the file exists at the second search path', () => {
            existsSync.withArgs('/first/path/my.file.ext').returns(false);
            existsSync.withArgs('/second/path/my.file.ext').returns(true);
            require
                .withArgs('/second/path/my.file.ext')
                .returns({ my: 'config' });

            expect(loader.load(['/first/path', '/second/path'])).toEqual({
                my: 'config',
            });
        });

        it('should return an empty object when the file is not found at any of the search paths', () => {
            expect(loader.load(['/first/path', '/second/path'])).toEqual({});
        });
    });
});
