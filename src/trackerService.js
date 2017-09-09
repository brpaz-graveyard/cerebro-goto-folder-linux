'use strict';

const exec = require('child_process').exec;
const url = require('url');
const path = require('path');
const stripAnsi = require('strip-ansi');
const { memoize } = require('cerebro-tools');

const DEFAULT_RESULTS_LIMIT = 15;

const SEARCH_MEMOIZE_OPTIONS = {
  promise: 'then',
  maxAge: 1000 * 60 * 60 * 1, // 1 hour
  preFetch: true
}

/**
 * Does a search on Tracker index.
 * @param {sring} term The search term
 * @param {object} options Tracker search options
 */
const search = memoize((term, options = {}) => new Promise((resolve, reject) => {

  let cmd = `tracker search -s --limit=${DEFAULT_RESULTS_LIMIT} ${term}` ;
  let results = [];

  exec(cmd, (error, stdout, stderr) => {

    if (error !== null) {
      reject(error);
    }

    const lines = stdout.toString().split('\n').splice(1);

    lines.forEach((line) => {
      let resource = processLine(line);

      if (resource) {
        results.push({
          name: resource.basename,
          path: resource.path,
          normalizedPath: resource.normalizedPath
        });
      }
    });

    resolve(results);
  });
}), SEARCH_MEMOIZE_OPTIONS);

/**
 * Processes each lines returned by tracker output.
 * @param {string} line
 * @return {object}
 */
const processLine = (line) => {
  line = stripAnsi(line).trim();

  // handles blank lines.
  if (line === "" || line === "..." ) {
    return false;
  }

  let parsedLine = url.parse(line);
  let resourcePath = decodeURI(parsedLine.path);
  let basename = decodeURI(path.basename(resourcePath));

  return {
    path: resourcePath,
    normalizedPath: resourcePath.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
    basename: basename,
  };
}

module.exports = {
  search
}
