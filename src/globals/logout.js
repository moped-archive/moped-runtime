import request from './request';

function logout() {
  return request('POST', '/logout').getBody().done(
    () => location.reload(),
  );
}

export default logout;
