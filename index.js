/**
 * shopware-6-api-client
 * (C) 2020-2021 bluewire.solutions GmbH & Co. KG, Tobias Hocke
 * tobias@bluewire.solutions
 */

const axios = require('axios').default
const OpenAPIClientAxios = require('openapi-client-axios').default
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

class Shopware {
  constructor (config) {
    this.client_id = config.client_id
    this.client_secret = config.client_secret
    this.strict = config.strict
    this.baseURL = config.baseURL

    this.axios = axios.create({
      baseURL: this.baseURL
    })
  }

  async auth () {
    try {
      const response = await this.axios.post('/api/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.client_id,
        client_secret: this.client_secret
      })
      if (response.status === 200) {
        this.access_token = response.data.access_token
        this.axios.defaults.headers.common.Authorization = this.access_token
        return true
      } else {
        return false
      }
    } catch (error) {
      if (this.strict) {
        // in strict-mode, fail hard and re-throw the error
        throw error
      } else {
        // just emit a warning about the errors
        console.warn(error)
      }
    }
  }

  async getClient () {
    let apiDefinition = this.baseURL + 'api/v3/_info/openapi3.json'
    try {
      await this.axios.get(apiDefinition)
    } catch (error) {
      if (error.response.status === 404) {
        apiDefinition = this.baseURL + 'api/_info/openapi3.json' // fallback for >=6.4.0.0
      } else {
        if (this.strict) {
          // in strict-mode, fail hard and re-throw the error
          throw error
        } else {
          // just emit a warning about the errors
          console.warn(error)
        }
      }
    }

    // pre sanitize api
    try {
      const response = await this.axios.get(apiDefinition)
      const spec = response.data

      /*
       * hotfix for https://github.com/bluewire-solutions/shopware-6-api-client/issues/3
       * caused by https://issues.shopware.com/issues/NEXT-15412
       */
      spec.components.schemas.relationshipLinks = {
        description: "A resource object **MAY** contain references to other resource objects (\"relationships\"). Relationships may be to-one or to-many. Relationships can be specified by including a member in a resource's links object.",
        properties: {
          self: {
            allOf: [
              {
                description: 'A `self` member, whose value is a URL for the relationship itself (a "relationship URL"). This URL allows the client to directly manipulate the relationship. For example, it would allow a client to remove an `author` from an `article` without deleting the people resource itself.',
                type: 'array'
              },
              {
                $ref: '#/components/schemas/link'
              }
            ]
          },
          related: {
            $ref: '#/components/schemas/link'
          }
        },
        type: 'object',
        additionalProperties: true
      }

      const data = JSON.stringify(spec)
      fs.writeFileSync('./openapi3.json', data)
    } catch (error) {
      if (this.strict) {
        // in strict-mode, fail hard and re-throw the error
        throw error
      } else {
        // just emit a warning about the errors
        console.warn(error)
      }
    }
    //

    this.api = new OpenAPIClientAxios({
      definition: './openapi3.json',
      axiosConfigDefaults: {
        // baseURL: this.baseURL,
        headers: {
          Authorization: this.access_token
        }
      },
      swaggerParserOpts: {
        resolve: {
          http: {
            headers: {
              Authorization: this.access_token
            }
          }
        }
      }
    })

    try {
      this.api.init()
      this.client = await this.api.getClient()
    } catch (error) {
      if (this.strict) {
        // in strict-mode, fail hard and re-throw the error
        throw error
      } else {
        // just emit a warning about the errors
        console.warn(error)
      }
    }
    return this.client
  }

  getShopwareUUID () {
    const id = uuidv4()
    return id.split('-').join('')
  }
}

module.exports = Shopware
