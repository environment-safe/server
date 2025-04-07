/* global describe:false */
import { chai } from '@environment-safe/chai';
import { it } from '@open-automaton/moka';
import { Server } from '../src/index.mjs';
import { enableSelfSigning } from '../src/https.mjs';
const should = chai.should();

enableSelfSigning();

describe('module', ()=>{
    describe('performs a simple test suite', ()=>{
        
        it('listens on http', async ()=>{
            try{
                const transports = ['http'];
                const port = 8082;
                const server = new Server({ transports });
                server.static('.');
                const foo = await server.endpoint(
                    '/foo', 
                    { transports, method: 'get', }, 
                    (req, res) =>  res.send('bar')
                );
                await server.start({ http: { port } });
                const url = `${transports[0]}://localhost:${port}${foo.http.uri()}`;
                const req = await fetch(url);
                const result = await req.text();
                result.should.equal('bar');
                await server.stop();
            }catch(ex){
                console.log(ex);
                should.not.exist(ex);
            }
        });
        
        it('listens on https', async ()=>{
            try{
                const transports = ['https'];
                const port = 8443;
                const server = new Server({ transports });
                server.static('.');
                const foo = await server.endpoint(
                    '/foo', 
                    { transports, method: 'get', }, 
                    (req, res) =>  res.send('bar')
                );
                const startOptions = { https: { port } };
                await server.start(startOptions);
                const url = `${transports[0]}://localhost:${port}${foo.https.uri()}`;
                const req = await fetch(url,  {rejectUnauthorized: false});
                const result = await  req.text();
                result.should.equal('bar');
                await server.stop();
            }catch(ex){
                console.log(ex);
                should.not.exist(ex);
            }
        });
        
        it('listens on combined http/https', async ()=>{
            try{
                const transports = ['http', 'https'];
                const uport = 8080;
                const sport = 8443;
                const server = new Server({ transports });
                server.static('.');
                const foo = await server.endpoint(
                    '/foo', 
                    { transports, method: 'get', }, 
                    (req, res) =>  res.send('bar')
                );
                const startOptions = { 
                    http: { port: uport },
                    https: { port: sport }
                };
                await server.start(startOptions);
                const url = `${transports[0]}://localhost:${uport}${foo.http.uri()}`;
                const req = await fetch(url);
                const result = await  req.text();
                result.should.equal('bar');
                const url2 = `${transports[1]}://localhost:${sport}${foo.https.uri()}`;
                const req2 = await fetch(url2,  {rejectUnauthorized: false});
                const result2 = await  req2.text();
                result2.should.equal('bar');
                await server.stop();
            }catch(ex){
                console.log(ex);
                should.not.exist(ex);
            }
        });
    });
});

