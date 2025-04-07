server
============================
A server encapsulation abstraction in buildless ESM (there is currently no browser server, though this does not preclude the possibility of one in the future) using multiple different transport formats. Currently it's a thin wrapper on top of express.

It's main function is to make testing simple by making self-signed certificates implicit so that features (like WebCrypto) which require `https` are present. And, lets be honest, you're probably actually going to deploy with https on a gateway rather than the server itself. 

Usage
-----

Running a standard http server:

```js
import { Server } from '@environment-safe/server';
(()=>{
    const transports = ['http'];
    const server = new Server({ transports });
    const foo = await server.endpoint(
        '/foo', { transports , method: 'get', }, 
        (req, res) => {
            res.send('bar')
        }
    );
    await server.start({http:{port:8080}});
    //do things
    await server.stop();
})();
```

Running a self-signed https service

```js
import { Server, enableSelfSigning } from '@environment-safe/server';
enableSelfSigning(); // disable cert verification
(()=>{
    const transports = ['https'];
    const server = new Server({ transports });
    const foo = await server.endpoint(
        '/foo', { transports , method: 'get', }, 
        (req, res) => {
            res.send('bar')
        }
    );
    await server.start({http:{port:8443}});
    //do things
    await server.stop();
})();
```

Running a standard https service

```js
import { Server } from '@environment-safe/server';
(()=>{
    const transports = ['https'];
    const server = new Server({ 
        transports,
        privateKey: `<private key>`,
        certificate: `<cert>`
    });
    const foo = await server.endpoint(
        '/foo', { transports , method: 'get', }, 
        (req, res) => {
            res.send('bar')
        }
    );
    await server.start({https:{port:8443}});
    //do things
    await server.stop();
})();


Roadmap
-------
- [x] - http
- [x] - https
- [ ] - websockets
- [ ] - webrtc
- [ ] - hypercore

Testing
-------

Run the es module tests to test the root modules
```bash
npm run import-test
```
to run the same test inside the browser:

```bash
npm run browser-test
```
to run the same test headless in chrome:
```bash
npm run headless-browser-test
```

to run the same test inside docker:
```bash
npm run container-test
```

Run the commonjs tests against the `/dist` commonjs source (generated with the `build-commonjs` target).
```bash
npm run require-test
```

Development
-----------
All work is done in the .mjs files and will be transpiled on commit to commonjs and tested.

If the above tests pass, then attempt a commit which will generate .d.ts files alongside the `src` files and commonjs classes in `dist`

