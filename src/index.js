'use strict';

const icon = require('../assets/icon.png');
const iconFolder = require('../assets/icon-folder.png');

const PLUGIN_REGEX = /goto\s(.*)/;
const PLUGIN_KEYWORD = 'goto';
const exec = require('child_process').exec;

const TrackerService = require('./trackerService');

const plugin = ({ term, display, actions, settings, hide }) => {

  let pluginSettings = settings || {};

  const match = term.match(PLUGIN_REGEX);

  if (match) {

    let searchQuery = match[1];

    if (!searchQuery) {
      display({
        title: 'Goto Folder',
        subtitle: 'Search folders indexed with Tracker',
        icon: icon
      });

      return;
    }

    display({
      id: 'loading',
      title: `Searching for ${searchQuery} ...`,
      icon: icon
    });

    TrackerService.search(searchQuery).then((results) => {

      results = results.map((result) => {
        return {
          title: result.name,
          subtitle: result.path,
          icon: iconFolder,
          onSelect: (event) => {
            let cmd = `xdg-open  ${result.normalizedPath}`;
            exec(cmd, (err) => {
              console.log(err);
            });
          },
          onKeyDown: (event) => {
            if (event.ctrlKey && event.keyCode === 84) {
              let cmd = `x-terminal-emulator --working-directory ${result.normalizedPath}`;
              exec(cmd, (err) => {
                console.log(err);
              });
            }
          }
        }
      });

      hide('loading');
      if (results.length > 0) {
        display(results);
      } else {
        display({
          title: `No results matching ${searchQuery}`,
          icon: icon
        });
      }

    }).catch((err) => {
      hide('loading');
      display({
        title: `Error when searcing for ${searchQuery}`,
        subtitle: error,
        icon: icon
      });
    })
  }
}

module.exports = {
  fn: plugin,
  name: 'Goto Folder',
  keyword: PLUGIN_KEYWORD,
  icon,
};
