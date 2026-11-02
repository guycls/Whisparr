import qs from 'qs';

function param(value, traditional = false) {
  if (value == null) {
    return '';
  }

  return qs.stringify(value, {
    arrayFormat: traditional ? 'repeat' : 'brackets',
    skipNulls: false
  });
}

export default param;
