const fs = require('fs');
const path = require('path');

function getFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, filter));
    } else if (file.endsWith(filter)) {
      results.push(file);
    }
  });
  return results;
}

const backendRoutes = getFiles('C:\\Users\\duruo\\Documents\\GitHub\\rubikcon\\backend\\src\\modules', '.routes.ts');
let backendApis = [];
backendRoutes.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/);
    if (match) {
      backendApis.push({ method: match[1].toUpperCase(), route: match[2], file: path.basename(file), line: index + 1 });
    }
  });
});
fs.writeFileSync('backend_apis.json', JSON.stringify(backendApis, null, 2));

const frontendFiles = getFiles('C:\\Users\\duruo\\Documents\\GitHub\\rubikcon\\academy\\src', '.ts').concat(getFiles('C:\\Users\\duruo\\Documents\\GitHub\\rubikcon\\academy\\src', '.tsx'));
let frontendApis = [];
frontendFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('apiRequest')) {
      const routeMatch = line.match(/['"](\/[^'"]+)['"]/);
      frontendApis.push({ file: path.basename(file), line: index + 1, content: line.trim(), route: routeMatch ? routeMatch[1] : 'dynamic' });
    }
  });
});
fs.writeFileSync('frontend_apis.json', JSON.stringify(frontendApis, null, 2));
