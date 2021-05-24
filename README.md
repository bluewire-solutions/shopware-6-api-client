# shopware-6-api-client

## Quick Start

```
npm install --save shopware-6-api-client
```

Login into your Shopware 6 backend to create an integration
in **Settings > System > Integrations** (https://docs.shopware.com/en/shopware-6-en/settings/system/integrationen)

```javascript
const Shopware = require('shopware-6-api-client')

const shopware = new Shopware({
  baseURL: 'https://www.your-shop.de/',
  client_id: 'YOUR-CLIENT-ID',
  client_secret: 'YOUR-CLIENT-SECRET',
  strict: false
});

(async () => {
  // get Bearer token for further requests
  await shopware.auth()

  // get the api client
  const shopwareApi = await shopware.getClient()

  // start executing requests

  // Example 1: get all manufacturers
  const productManufacturer = await shopwareApi.getProductManufacturerList()

  // Example 2: 
  await shopwareApi.createProductManufacturer(null, { 'name': 'The Company' })
})()

```

## Functional Description
The Shopware 6 API exposes an OpenAPI specification under 
```
/api/_info/openapi3.json
```
Find further details here https://docs.shopware.com/en/shopware-platform-dev-en/admin-api-guide

This module is an envelope around (https://github.com/anttiviljami/openapi-client-axios). For working with the API-client refer to their documentation.

To get a list of all endpoint paths feel free to perform this command
```javascript
console.log(shopwareApi.paths)
```

