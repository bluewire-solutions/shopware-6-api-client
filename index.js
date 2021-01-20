/**
 * shopware-6-api-client
 * (C) 2020-2021 bluewire.solutions GmbH & Co. KG, Tobias Hocke
 * tobias@bluewire.solutions
 */

const axios = require('axios').default
const OpenAPIClientAxios = require('openapi-client-axios').default

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
    this.api = new OpenAPIClientAxios({
      definition: this.baseURL + 'api/v3/_info/openapi3.json',
      axiosConfigDefaults: {
        baseURL: this.baseURL = 'https://sw6.bwskun.de/api/v3',
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
}

module.exports = Shopware
