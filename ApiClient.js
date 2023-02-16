const axios = require('axios');
const querystring = require('querystring')
const crypto = require('hash.js')
const parser = require('fast-xml-parser')
const uuid = require('uuid');


class BigBlueButtonApiClient {
    async makeApiCall(action, params = {}, type = 'GET') {
        try {
            const response = await this.httpClient(action, params, type)
            return response;
        } catch (error) {
            console.log('error',error.message)
            return error;
        }
    }

    httpClient(action, params, type) {
        let URL = this.constructUrl(action, params)
        return axios(URL, {
            method: type,
            headers: {Accept: 'text/xml, application/json, text/plain, */*'},
        }).then((response) => {
            return response.data
        }).then((xml) => {
            return this.parseXml(xml)
        })
    }

    constructUrl(action, params) {
        const BIG_BLUE_BUTTON_API_URL = process.env.BIGBLUEBUTTON_API_URL;
        const BIG_BLUE_BUTTON_SECRET = process.env.BIGBLUEBUTTON_SECRET
        params.checksum = this.generateChecksum(action, params, BIG_BLUE_BUTTON_SECRET)
        const URL = `${BIG_BLUE_BUTTON_API_URL}/api/${action}?${querystring.encode(params)}`
        console.log('URL',URL)
        return URL;
    }

    generateChecksum(callName, queryParams, secret) {
        return crypto
            .sha1()
            .update(`${callName}${querystring.encode(queryParams)}${secret}`)
            .digest('hex')
    }

    parseXml(xml) {
        const jsonFormat = parser.parse(xml).response

        if (jsonFormat?.meetings) {
            let meetings = jsonFormat.meetings ? jsonFormat.meetings.meeting : []
            meetings = Array.isArray(meetings) ? meetings : [meetings]
            jsonFormat.meetings = meetings
        }
        if (jsonFormat?.recordings) {
            let recordings = jsonFormat.recordings ? jsonFormat.recordings.recording : []
            recordings = Array.isArray(recordings) ? recordings : [recordings]
            jsonFormat.recordings = recordings
        }
        return jsonFormat
    }

    async createMeeting(params) {
        params.meetingID = uuid.v4()
        console.log('create meeting params', params)
        return this.makeApiCall('create', params,'POST');
    }

    async joinMeeting(params) {
        params.redirect = 'false'
        return this.makeApiCall('join', params);
    }

    async endMeeting(params){
        return this.makeApiCall('end')
    }

    async getMeetingInfo(params) {
        return this.makeApiCall('getMeetingInfo', params);
    }

    async getMeetings() {
        return this.makeApiCall('getMeetings');
    }

    async createWebhook(params) {
        return this.makeApiCall('hooks/create', params)
    }

    async getWebhooks(params) {
        return this.makeApiCall('hooks/list', params)
    }

    async destroyHooks(params) {
        return this.makeApiCall('hooks/destroy', params)
    }

    // Add more API methods as needed...
}

const apiClient = new BigBlueButtonApiClient();
module.exports = apiClient;