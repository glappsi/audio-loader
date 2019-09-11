import xhrIntercept from './interceptors/xhr';
import fetchIntercept from './interceptors/fetch';

export default () => {
  const start = () => console.log('start request');
  const end = () => console.log('end request');

  xhrIntercept(start, end);
  fetchIntercept(start, end);
};
