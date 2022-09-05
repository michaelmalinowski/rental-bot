const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const puppeteer = require("puppeteer");
const fs = require('fs')
const path = require('path')
const axios = require('axios')

async function getDetailedListing(flatName, flatId) {
    try {
        let response = await fetch(`https://www.daft.ie/_next/data/qXQq1ZphfrDofGxFSGiaj/property.json?address=${flatName}&id=${flatId}`)
        if (!response.status >= 200 && !response.status < 300) {
            throw new Error(`Request failed with response code: ${response.status}`)
        }

        let htmlText = await response.text();
        const buildId = htmlText.slice(htmlText.indexOf("buildId") + 10, htmlText.indexOf("buildId") + 31)

        response = await fetch(`https://www.daft.ie/_next/data/${buildId}/property.json?address=${flatName}&id=${flatId}`)

        if (!response.status >= 200 && !response.status < 300) {
            throw new Error(`Request failed with response code: ${response.status}`)
        }
        let detailedListing = await response.json();
        return detailedListing.pageProps.listing;

    } catch(err) {
        console.log(`Could not get detailed listing for ${flatId}`);
        console.error(err);
        return null;
    }
}

getDetailedListing('studio-apartment-74-grosvenor-road-rathmines-dublin-6', '4048618')