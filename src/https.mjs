//todo: conditionally import when we support the browser
import web from 'https';
import express from 'express';
//import {Path} from '@environment-safe/file';
//import { isBrowser, isJsDom } from 'browser-or-node';
import * as mod from 'module';
//import * as path from 'path';
//import * as fs from 'fs/promises';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));

export const enableSelfSigning =()=>{
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
};

const ensureCreds = async (options={})=>{
    try{ //TODO: auto file handling via option
        throw new Error('');
        /*const results = await Promise.all([
            fs.readFile('./public.key'),
            fs.readFile('./private.key'),
            fs.readFile('./certificate.key')
        ]);
        console.log({
            public: results[0].toString(),
            private: results[1].toString(),
            certificate: results[2].toString()
        });
        return {
            public: results[0].toString(),
            private: results[1].toString(),
            certificate: results[2].toString()
        }*/
    }catch(ex){
        ensureRequire();
        var attrs = [
            { name: 'commonName', value: options.name || 'localhost' }
        ];
        const selfsigned = internalRequire('selfsigned');
        const output = await new Promise((resolve, reject)=>{
            selfsigned.generate(attrs, {
                days: 365 
            }, function (err, pems) {
                if(err) return reject(err);
                resolve(pems);
            });
        });
        //await fs.writeFile('./public.key', output.public);
        //await fs.writeFile('./private.key', output.private);
        //await fs.writeFile('./certificate.key', output.cert);
        return output;
    }
};

export const https = {
    init: (options={})=>{
        return express();
    },
    start: async (app, options={})=>{
        const port = options.port || 8080;
        let privateKey = options.privateKey;
        let cert = options.certificate;
        if(!(options.privateKey && options.certificate)){
            const creds = await ensureCreds();
            privateKey = creds.private;
            cert = creds.cert;
        }
        const server = web.createServer({
            key: privateKey,
            cert: cert
        }, app);
        await new Promise((resolve, reject)=>{
            server.listen(port, (err)=>{
                if(err) return reject(err);
                resolve();
            });
        });
        return server;
    },
    stop: async (server, options={})=>{
        await new Promise((resolve, reject)=>{
            server.close((err)=>{
                if(err) return reject(err);
                resolve();
            });
        });
    },
    static: async (server, options={})=>{
        server.use(express.static(options.directory || '.'));
    },
    endpoint: async (server, endpoint, handler, options={})=>{
        const method = (options.method || 'get').toLowerCase();
        server[method](endpoint, handler);
    }
};