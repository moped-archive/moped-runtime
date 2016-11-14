import request from 'then-request';

const csrf = request('GET', '/csrf_token').getBody('utf8').then(response => {
  return JSON.parse(/console\.log\((.*)\)/.exec(response)[1]);
});
export default function (method, url, options = {}) {
  const headers = options.headers || {};
  const result = csrf.then(
    token => request(
      method,
      url,
      {
        ...options,
        headers: {...headers, 'x-csrf-token': token},
      }
    )
  );
  result.getBody = encoding => result.then(res => res.getBody(encoding));
  return result;
}

  // {headers: {'x-csrf-token': csrf}}
