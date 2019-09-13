import { DISABLE_HEADER } from '..';

export default (start: Function, end: Function) => {
  (function(send) {
    XMLHttpRequest.prototype.send = function(data) {
      const audioLoaderDisabled = (this as any).AUDIO_LOADER_OFF;
      if (!audioLoaderDisabled) {
        start();
      }

      var onreadystatechange =
        this.onreadystatechange && this.onreadystatechange.bind(this);

      this.onreadystatechange = state => {
        const readyState =
          state.currentTarget && (state.currentTarget as any).readyState;
        if (readyState === 4 && !audioLoaderDisabled) end();
        onreadystatechange && onreadystatechange(state);
      };

      send.call(this, data);
    };
  })(XMLHttpRequest.prototype.send);

  (function(setRequestHeader) {
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      if (name === DISABLE_HEADER) {
        (this as any).AUDIO_LOADER_OFF = true;
      }

      setRequestHeader.call(this, name, value);
    };
  })(XMLHttpRequest.prototype.setRequestHeader);
};
