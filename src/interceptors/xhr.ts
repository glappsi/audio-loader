export default (start: Function, end: Function) => {
  (function(send) {
    XMLHttpRequest.prototype.send = function(data) {
      start();

      var onreadystatechange =
        this.onreadystatechange && this.onreadystatechange.bind(this);

      this.onreadystatechange = state => {
        const readyState =
          state.currentTarget && (state.currentTarget as any).readyState;
        if (readyState === 4) end();
        onreadystatechange && onreadystatechange(state);
      };

      send.call(this, data);
    };
  })(XMLHttpRequest.prototype.send);
};
