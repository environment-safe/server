/*
import { isBrowser, isJsDom } from 'browser-or-node';
import * as mod from 'module';
import * as path from 'path';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
//*/

/**
 * A JSON object
 * @typedef { object } JSON
 */

//todo: conditionally import these when we support the browser
import { http } from './http.mjs';
import { https } from './https.mjs';

export const services = {
    http,
    https
    //todo: support websockets
    //todo: support webrtc
    //todo: support hypercore
};
 
export class Server{
    constructor(options={}){
        this.options = options;
        this.apps = {};
        this.servers = {};
        this.services = services;
        //let transport = null;
        let transportName = null;
        for(let lcv=0; lcv < options.transports.length; lcv++){
            transportName = options.transports[lcv];
            //transport = services[transportName];
            this.apps[transportName] = services[transportName].init(options);
        }
    }
    
    async static(path, options = { transports: ['http'] }){
        const result = {};
        let transport = null;
        let transportName = null;
        for(let lcv=0; lcv < options.transports.length; lcv++){
            transportName = options.transports[lcv];
            transport = services[transportName];
            if(!services[transportName]) throw new Error(
                `Unavailable transport: ${transportName}`
            );
            await transport.static(this.apps[transportName], options);
        }
        return result;
    }
    
    async endpoint(path, options = { transports: ['http'] }, handler){
        const result = {};
        const transports = options.transports || this.options.transports;
        let transport = null;
        let transportName = null;
        for(let lcv=0; lcv < transports.length; lcv++){
            transportName = transports[lcv];
            transport = services[transportName];
            await transport.endpoint(this.apps[transportName], path, handler, options);
            result[transportName] = {uri: (context)=>{
                return path;
            }};
        }
        return result;
    }
    
    
    async start(options){
        const transports = options.transports || this.options.transports;
        let transport = null;
        let transportName = null;
        for(let lcv=0; lcv < transports.length; lcv++){
            transportName = transports[lcv];
            transport = services[transportName];
            this.servers[transportName] = await transport.start(
                this.apps[transportName], 
                options[transportName]
            );
        }
    }
    
    async stop(options={}){
        const transports = 
            options.transports || 
            this.options.transports || 
            Object.keys(this.services);
        let transport = null;
        let transportName = null;
        for(let lcv=0; lcv < transports.length; lcv++){
            transportName = transports[lcv];
            transport = services[transportName];
            await transport.stop(
                this.servers[transportName], 
                options[transportName]
            );
        }
    }
}