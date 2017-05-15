import expect from 'expect';
import {
    signIn,
    isExpired,
    verifyUser,
    verifySignature,
} from '../src/helper/authenticationHelper';

// import dependency to this target.
import jws from 'jws';

xdescribe('ClientApp signs in to Cognito user pool', () => {
    let invalidSignIn;

    context('Given that ClientApp has wrong id or password', () => {
        before(() => {
            invalidSignIn = signIn('Sei', 'Temporary1');
        });

        it('will not be able to sign in to the user pool');
        xit('will receive an error message', async () => {
            await invalidSignIn((err, token) => {
                if (err) {
                    return expect(err.message).toEqual('Incorrect username or password.');
                }
                console.log('mytoken: ', token);
                expect(token).toEqual('something');
            });
        });
    });
});

xdescribe('Given a invalid id token', () => {
    const expiredToken = 'eyJraWQiOiJGRWY0UStSUDF3UHY1UkZsS29XOEFkVGFTWGpKVGt3Z2Qyb0I1b3c4cWdnPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjZmNlMGMyNi01NmU2LTQ1NGYtYmI5NC0zZGU0YzYyNzk3NzIiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfZHdXWjZRWlRBIiwiZXhwIjoxNDg3MzMwODcwLCJpYXQiOjE0ODczMjcyNzAsImp0aSI6IjVhNmQ4OWZiLTc1ZjktNDlhYy1iOWZiLWE0MTM0NTk4NWU0MiIsImNsaWVudF9pZCI6IjZmdTZ2ZWdvcGs0dWNwdDRzcnY3Y2prMWk5IiwidXNlcm5hbWUiOiJTZWkifQ.euWHOH0XYyLUXUNxdeKYnDMAt97aghY2u47HKJRgYouZNT-fdBy7O-8MhroqwYI7ZxVws94WX-ACePL9jyyzojW_DyQDqCjHo7fFldHiOxR59JrmftQr4U-cF-ufN1FC8Mddv00vlw_DGAshHQfD0QeNiKzoTCt8HcyZhdt8vZFk5LrM80LZaQ77FCXW_maeofdqGTastGCa49kYdyKZyWC7ex8kJ8843eDm0ZbIuiylCLLwULaJ3SA2S3KlZX-h7APFbxdNuNrHec_tYCyhLbaBrVXJfjkjd4lhtBp8Rf9Mp2BfRU0Ktzc6SkMYt8RF7epGRI-2QbWoaYA6HpfJtg';
    context('when id token expires', () => {
        it('will find it is invalid token', async () => {
            const bool = await isExpired(expiredToken);
            expect(bool).toEqual(false);

        });
        it('will find that the user is invalid', async () => {
            const bool = await verifyUser(expiredToken);
            expect(bool).toEqual(false);
        });
    });
    context('when id token is broken', () => {
        beforeEach( async () => {
        });

        it('will fail in verifying the signature', async () => {
            const brokenToken = expiredToken + '2';
            const bool = await verifySignature(brokenToken);
            expect(bool).toEqual(false);
        });
        it('will call jws function', async () => {
            const brokenToken = expiredToken + '2';
            const spyVerify = expect.spyOn(jws, 'verify');
            await verifySignature(brokenToken);
            // const spyDecode = expect.spyOn(jws, 'decode');
            // expect(spyDecode).toHaveBeenCalled();
            expect(spyVerify).toHaveBeenCalled();
        });
    });
});

xdescribe('Given a valid id token', () => {
    let validToken;
    before(async () => {
        const validSignIn = signIn('Sei', 'Temporary1@');
        await validSignIn((err, token) => {
            validToken = token;
        });
    });

    context('when id token does not expires', () => {
        it('will find id token is valid', () => {
            expect(validToken).toBeA('string');
        });
    });

    context('when id token is sent from the valid OIDP', () => {
        it('will succeed in verifying the signature', async () => {
            const bool = await verifySignature(validToken);
            expect(bool).toEqual(true);
        });
    });
});

