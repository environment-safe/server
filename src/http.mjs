//todo: conditionally import when we support the browser
import web from 'http';
import express from 'express';
export const http = {
    init: (options={})=>{
        return express();
    },
    start: async (app, options={})=>{
        var server = web.createServer(app);
        const port = options.port || 8080;
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