// Example of a more typical implementation structure
const chokidar = require('chokidar');
const XLSX = require('xlsx');
const path = require('path');
const xml2js = require('xml2js');
const fs = require('fs');

// Initialize watcher.
const watcher = chokidar.watch('input', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

// Something to use when events are received.
const log = console.log.bind(console);

// Add event listeners.
watcher.on('add', handleNewFile)

function handleNewFile(filePath) {
  log(`File ${path} has been added`);

  const ext = path.extname(filePath)

  // we only care about excel files
  if (ext === ".xlsx") {
    const workbook = XLSX.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    console.log(xlData);

    const builder = new xml2js.Builder();

    // <user role="administrator" identifier="0000000000101" name="Administrator" password="12Ev3CEYljHE." login="1234"/>
    const xml = builder.buildObject({
      $: {serverId: "", version: ""}, users: xlData.map(d => ({
        $: {role: d.role, identifier: d.login_1, name: d.name, password: d.password, login: d.login}
      }))
    });

    // write xml
    fs.writeFileSync('./users.xml', xml);

    // delete the file
    fs.unlinkSync(filePath);
  }
}