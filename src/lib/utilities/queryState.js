// function to set query state in URL
export const queryState = (values = {}) => {
  const url = new URL(window.location.toString());
  for (let [k, v] of Object.entries(values)) {
    if (!!v) {
      url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v));
    } else {
      url.searchParams.delete(k);
    }
  }
  history.replaceState({}, "", url);
};