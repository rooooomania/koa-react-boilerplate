const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || 'development';
const src = env === 'production' ? './api/build/server' : './api/src/server';

console.warn(`the stage is ${env}...`);
console.warn(`the src is ${src}...`);

if (env === 'development') {
    // require ('babel-polyfill');
    require ('babel-register');
}

const app = require(src).default;
app.listen(port);
