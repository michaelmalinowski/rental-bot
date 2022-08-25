const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const puppeteer = require("puppeteer");


class RentalBot{
    constructor(username, password, listingScanInterval=2) {
        this.username = username
        this.password = password
        this.listingScanInterval = listingScanInterval

        this.listingIdsRepliedTo = []

        this.replyName = null;
        this.replyEmail = null;
        this.replyMessage = null;

        this.mostRecentFlatId = null;
    }

    setReplyInfo(replyInfo) {
        this.replyName = replyInfo.name;
        this.replyEmail = replyInfo.email;
        this.replyMessage = replyInfo.message;
    }

    run() {
        this.filterListings(false)
        setInterval(() => {
            this.filterListings()
            let date = new Date()
            console.log(`Checking Listings ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
        }, this.listingScanInterval * 60 * 1000)
    }

    async filterListings(isEmailing=true) {
        let listingsObject = await this.getListings();
        if (listingsObject == null) {
            return;
        }
        
        let listingsList = listingsObject.listings;
        let lastSeen = 0;
        listingsList.some(element => {
            let flat = element.listing;
            if (this.mostRecentFlatId == null) {
                return true;
            }

            if (this.mostRecentFlatId == flat.id) {
                return true;
            }
            ++lastSeen;
        });

        this.mostRecentFlatId = listingsList[0].listing.id;

        if (lastSeen == listingsList.length) {
            return
        }
        listingsList.forEach(element => {
            let flat = element.listing;
            if (isEmailing && lastSeen > 0) {
                console.log(`Attempting to email flat: ${flat.title}`);
                this.sendEmailReply(flat.id, flat.title)
            }
            --lastSeen;
        })
    }
    
    async getListings() {
        try {
            let response = await fetch("https://gateway.daft.ie/old/v1/listings", {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "brand": "daft",
                "cache-control": "no-cache, no-store",
                "content-type": "application/json",
                "expires": "0",
                "platform": "web",
                "pragma": "no-cache",
                "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://www.daft.ie/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "{\"section\":\"residential-to-rent\",\"filters\":[{\"values\":[\"published\"],\"name\":\"adState\"}],\"andFilters\":[],\"ranges\":[{\"from\":\"\",\"to\":\"2300\",\"name\":\"rentalPrice\"}],\"paging\":{\"from\":\"0\",\"pageSize\":\"20\"},\"geoFilter\":{\"storedShapeIds\":[\"65\",\"66\",\"68\",\"70\",\"73\"],\"geoSearchType\":\"STORED_SHAPES\"},\"terms\":\"\",\"sort\":\"publishDateDesc\"}",
            "method": "POST"
            });

            if (!response.status >= 200 && !response.status < 300) {
                throw new Error(`Request failed with response code: ${response.status}`)
            }

            let jsonListings = await response.json();

            return jsonListings;

        } catch(err) {
            console.log(`Cound not fetch listings`);
            console.error(err);
            return null;
        }
    }

    async sendEmailReply(listingId, listingTitle='') {
        try {
            if (listingId in this.listingIdsRepliedTo) {
                console.log(`Email message to ${listingTitle} has already been sent before`);
                return 
            }

            if (this.replyName == null ||this.replyEmail == null || this.replyMessage == null) {
                throw new Error(`Missing reply info. Message failed to send. ${this.replyName}, ${this.replyEmail}, ${this.replyMessage}`)
            }

            const accessToken = await this.fetchAccessToken();
            let json = {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "authorization": `Bearer ${accessToken}`,
                    "brand": "daft",
                    "cache-control": "no-cache, no-store",
                    "content-type": "application/json",
                    "expires": "0",
                    "platform": "web",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "Referer": "https://www.daft.ie/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": `{\"adId\":${listingId},\"name\":\"${this.replyName}\",\"email\":\"${this.replyEmail}\",\"message\":\"${this.replyMessage}\"}`,
                "method": "POST"
            }
            let response = await fetch("https://gateway.daft.ie/old/v1/reply", json)
            

            if (response.status >= 200 && response.status < 300) {
                this.listingIdsRepliedTo.push(listingId);
                console.log(`Email message to ${listingTitle} sent successfully`);
                return
            }

            throw new Error(`Failed with a response code: ${response.status}`);
        } catch(err) {
            console.log(`Email message to ${listingId} FAILED`);
            console.error(err);
        }
    }

    async fetchAccessToken() {
        try {
            const browser = await puppeteer.launch();
            const [page] = await browser.pages();
        
            await page.goto('https://www.daft.ie/auth/authenticate', { waitUntil: 'networkidle0' });

            await page.type('input[id=username]', this.username)
            await page.type('input[name=password]', this.password)
            await page.click('input[name=login]');
            
            await page.waitForNavigation()
            
            const siteData = await page.evaluate(() => {
                let pageData = document.getElementById('__NEXT_DATA__').textContent;
                
                return pageData;
            })
        
            let accessTokenIndexStart = siteData.indexOf('"access_token":"');
            const accessToken = siteData.slice(accessTokenIndexStart + 16, siteData.indexOf('"', accessTokenIndexStart + 17));

            await browser.close();
            
            return accessToken
        } catch (err) {
            console.error(err);
            console.log("Access token could not be obtained");
        }
    }
}

module.exports = RentalBot