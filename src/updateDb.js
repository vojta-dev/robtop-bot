import fs from 'fs';
import path from 'path';

let allMessages = [];

readFiles('./rawDb').then((files) => {
  files.forEach((file) => {
    allMessages.push(...JSON.parse(file.contents).messages);
  });

  allMessages = allMessages
    .sort((a, b) => a.id - b.id)
    .map((message) => message.content)
    .filter((message) => message !== '' && message.length > 7)
    .map((message) => message.replaceAll('@', '').replaceAll('RobTopGames', 'RobTop').replaceAll('Deleted User', '').slice(0, 280));

  fs.writeFileSync('./db/messages.json', JSON.stringify(allMessages));
});

// ye i basically copied this function from https://stackoverflow.com/a/43514856/,
// because i thought i was only gonna use it one time,
// and now, well, too lazy to rewrite it lmao
function readFiles(dirname) {
  return new Promise((resolve) => {
    fs.readdir(dirname, (error, filenames) => {
      function promiseAllP(items, block) {
        const promises = [];
        items.forEach((item, index) => {
          promises.push(
            ((item) => {
              return new Promise((resolve) => block.apply(this, [item, resolve]));
            })(item, index)
          );
        });
        return Promise.all(promises);
      }
      promiseAllP(filenames, (filename, resolve) => {
        fs.readFile(path.resolve(dirname, filename), 'utf-8', (error, content) => {
          return resolve({ filename, contents: content });
        });
      }).then((results) => resolve(results));
    });
  });
}
