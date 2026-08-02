const fs = require('fs');

const backendApis = JSON.parse(fs.readFileSync('backend_apis.json'));
const frontendApis = JSON.parse(fs.readFileSync('frontend_apis.json'));

const frontendRoutes = new Set();
frontendApis.forEach(f => {
  if (f.route !== 'dynamic') {
    frontendRoutes.add(f.route);
  } else {
    // try to extract the base path from the template string
    const match = f.content.match(/(\/[^$]+)/);
    if (match) {
      frontendRoutes.add(match[1]);
    }
  }
});

const unused = backendApis.filter(b => {
  // Try to see if any frontend route matches or starts with the base path of the backend route
  let baseBackend = b.route.split('/:')[0]; 
  // Add the prefix based on how it's mounted in app.ts
  let fullBackendPath = '';
  if (b.file === 'auth.routes.ts') fullBackendPath = '/api/auth' + (b.route === '/' ? '' : b.route);
  else if (b.file === 'games.routes.ts') fullBackendPath = '/api/games' + (b.route === '/' ? '' : b.route);
  else if (b.file === 'gigs.routes.ts') fullBackendPath = '/api/gigs' + (b.route === '/' ? '' : b.route);
  else if (b.file === 'platform.routes.ts') fullBackendPath = '/api/platform' + (b.route === '/' ? '' : b.route);
  else fullBackendPath = '/api/academy' + (b.route === '/' ? '' : b.route);
  
  // The frontend calls /auth or /academy without /api because the proxy or baseURL handles it
  let expectedFrontendPath = fullBackendPath.replace('/api', '');
  let baseExpected = expectedFrontendPath.split('/:')[0];

  let isUsed = false;
  for (let f of frontendRoutes) {
    if (f.startsWith(baseExpected) || baseExpected.startsWith(f)) {
      isUsed = true;
      break;
    }
  }
  return !isUsed;
});

console.log(JSON.stringify(unused, null, 2));
