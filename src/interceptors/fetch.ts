import * as fetchIntercept from 'fetch-intercept';

export default (start: Function, end: Function) => {
  fetchIntercept.register({
    request: function(url, config) {
      // Modify the url or config here
      start();
      return [url, config];
    },

    requestError: function(error) {
      // Called when an error occured during another 'request' interceptor call
      end();
      return Promise.reject(error);
    },

    response: function(response) {
      // Modify the reponse object
      end();
      return response;
    },

    responseError: function(error) {
      // Handle an fetch error
      end();
      return Promise.reject(error);
    }
  });
};
