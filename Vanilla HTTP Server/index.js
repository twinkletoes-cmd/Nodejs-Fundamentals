//Import the built-in http module. Use http.createServer() with a callback that receives (req, res) — every request that ever hits your server runs through this one function. Call .listen(3000) (or any port) on the returned server, and console.log a confirmation once it's listening. For now, just have the callback do one thing: res.end('Hello world'). Run it and visit http://localhost:3000 in a browser to confirm you get a response.

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { url } from 'inspector';

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.json': 'application/json',
  };

const server = http.createServer(async (req, res) => {
    try{
        const {url} = req;
        const baseUrl = `http://${req.headers.host}`;
        console.log(baseUrl, req.headers);
        const parsedUrl = new URL(url, baseUrl);

        const query = parsedUrl.searchParams.get('q');
        const pathName = parsedUrl.pathname;

        if(pathName === '/'){
            res.writeHead(200, {
                'Content-type': 'text/plain' 
            });
            res.end("Welcome to the homepage here");
        }else if(pathName === '/about'){

            const filePath = './public/dummy.html';
            const contentType = getContentType(filePath);

            const content = await fs.readFile(filePath, 'utf-8')

            res.writeHead(200, {
                'Content-type': contentType 
            });

            res.end(`Welcome to the about page. ${content}`);
        }else if(pathName === '/search'){
            res.writeHead(200, {
                'Content-type': 'text/plain'
            });
            res.end(`${query ? `You searched for ${query}` : "Query does not exist"}`);
        }
        else {
            res.writeHead(404, {
                'Content-type': 'text/plain' 
            })
            res.end("Page not found")
        }

    }catch(err){
        if(err.code === 'ENOENT'){
            res.writeHead(404, {
                'Content-type': 'text/plain'
            })
            res.end("enoent");
        } else {
            console.error("Error 500, Server response", err)
            res.writeHead(500, {
                'Content-type': 'text/plain'
            })
            res.end("Server error");
        }
    }
})

function getContentType(file){
    const ext = path.extname(file);
    const headerType = mimeTypes[ext];
    return headerType ? headerType : 'application/octet-stream'
}

server.listen(3000, () => {
    console.log("Server is now active");
    console.log('url: ', url)
});

//Before writing any logic, just console.log(req.method) and console.log(req.url) inside your request handler, then visit a few different URLs in your browser (e.g. /, /about, /foo?bar=1) and watch what prints in your terminal. Get a feel for what's actually available on the req object before you try to use it for anything.

//Instead of just res.end(...), use res.writeHead(statusCode, headers) before res.end(body) to explicitly set a status code and a Content-Type header. Try sending back plain text with 'text/plain', then try HTML with 'text/html' and a body containing actual HTML tags — view the page source in your browser to see the difference a header makes to how the browser interprets identical-looking text.

//Using the req.url and req.method you inspected in step 2, write if/else (or switch) logic so different URLs get different responses — e.g. '/' shows a homepage message, '/about' shows something else. Anything that doesn't match a known route should fall through to a 404 response with an appropriate status code and a 'Not found' message. This is the exact logic Express hides from you later.

//req.url includes everything after the path, like /search?q=lagos&limit=5. Use Node's built-in url module (new URL(req.url, `http://${req.headers.host}`)) to parse that into a usable object, then read individual parameters via .searchParams.get('q'). Try building a route that reads a query parameter and echoes it back in the response.

//Create a small public/ folder with a real file in it (an .html file, an image, whatever). When a matching route is hit, use fs.readFile (or the promise version) to read that file from disk and send its contents as the response body — instead of a hardcoded string. This is the same fs skill from Project 1, applied to a new purpose.

//Different file types need different Content-Type headers to display correctly in a browser — .html needs text/html, .css needs text/css, .png needs image/png, and so on. Use Node's path module to extract a file's extension (path.extname), then write a small lookup (an object mapping extensions to MIME type strings) to pick the right header before sending the file.

//Wrap your file-reading logic so that a missing file (fs throwing ENOENT — you've handled this exact error code before, in Project 1) results in a clean 404 response instead of crashing the server or hanging the request. Also think about what should happen if something else goes wrong unexpectedly — a 500 response is the conventional fallback for 'something broke on our end.'