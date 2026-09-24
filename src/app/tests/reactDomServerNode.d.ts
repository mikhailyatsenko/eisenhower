// Node build of react-dom/server: the browser build needs MessageChannel,
// which jsdom doesn't have
declare module 'react-dom/server.node' {
  export { renderToString } from 'react-dom/server';
}
