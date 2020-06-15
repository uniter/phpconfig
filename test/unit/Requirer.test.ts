/*
 * PHPConfig - Loads Uniter's PHP configuration
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/phpconfig/
 *
 * Released under the MIT license
 * https://github.com/uniter/phpconfig/raw/master/MIT-LICENSE.txt
 */

import Requirer from '../../src/Requirer';
import sinon from 'ts-sinon';

type require = sinon.SinonStub & ((file: string) => unknown);

describe('Requirer', () => {
    let nodeRequire: require;
    let requirer: Requirer;

    beforeEach(() => {
        nodeRequire = (sinon.stub() as unknown) as require;

        requirer = new Requirer(nodeRequire);
    });

    describe('require()', () => {
        it('should return the exports object for the module', () => {
            const myExports = { myProp: 21 };
            nodeRequire.withArgs('/my/path/to/my_module').returns(myExports);

            expect(requirer.require('/my/path/to/my_module')).toEqual(
                myExports
            );
        });
    });
});
