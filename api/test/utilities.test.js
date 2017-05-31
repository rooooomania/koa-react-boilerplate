import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import { promisify, objectify } from '../src/helper/utilities';

describe('Given callbackBasedAPI', () => {
    it('will transfrom to promise', () => {
        const callbackBasedApi = (callback) => {
            setTimeout(() => {
                callback(null, 'test');
            }, 1000);
        };

        const promisified = promisify(callbackBasedApi);
        return promisified()
            .then((data) => {
                expect(data).to.equal('test');
            });
    });
});

describe('Given a string for query parameter', () => {
    it('Remove a questionmark', () => {
        const result =  objectify('?moriya');
        expect(result).to.equal('moriya');
    });
    it('Objectify `xxx=yyy` to {xxx: yyy})', () => {
        const result = objectify('xxx=yyy');
        expect(result).to.deep.equal({xxx: 'yyy'});

    });
    it('Objectify complex query parameters', () => {
        const result = objectify('?moriya=sei&yamada=taro');
        expect(result).to.deep.equal({
            moriya: 'sei',
            yamada: 'taro'
        });
    });
});
