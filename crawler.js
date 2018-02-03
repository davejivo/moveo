/**
 * Created by davej on 2/2/2018.
 */

const cheerio = require('cheerio'),
      request = require("request");


const url = "https://www.timeanddate.com", //main url
    scrapeUrl = url + '/weather?query=', //scrape url
    linksResultSelector = "#clc-results span.accent", //selecor for results section
    linkSelector = 'table tbody tr:nth-child(1) a', //WE TAKE THE FIRST ONE
    locationSelector =  '.main-content-div h1',
    stateImgSelector = '.main-content-div h1 img',
    temperatureSelector = '.main-content-div #qlook div.h2',
    humiditySelector = '.main-content-div #qfacts p:nth-child(7)',
    windStringSelector = '.main-content-div #qlook',//contains more data then we need
    windStartPattern = "Wind",
    windEndPattern = "↑";


function scrapeLink(link, callback) {
    try{
        request(link, function (err, response, html) {
            getInfo(link, html, callback);
        });
    }catch (e){
        callback(e.message, null);
    }

}

function getInfo(link, html, callback) {
    var $ = cheerio.load(html);
    var info = {};
    try {
        info.location = $(locationSelector).text();
        info.stateImg = $(stateImgSelector).attr('src');
        info.temperature = $(temperatureSelector).text();
        info.humidity = $(humiditySelector).text();
        info.link = link;
        var windStr = $(windStringSelector).text();
        info.windSpeed = windStr.substring(windStr.indexOf(windStartPattern), windStr.indexOf(windEndPattern));
        callback(null, info);
    } catch (e) {
        callback(e.message, null);
    }
}

module.exports = {
    scrapeWeather : function (values, callback) {
        if (values.link){
            scrapeLink(values.link, callback);
        }
        else{ //get weather by city
            //add city to url params
            var cityScrapeUrl = scrapeUrl +  values.city;
            request(cityScrapeUrl, function (err, response, html) {
                if (err){
                    callback(err);
                }else{
                    $ = cheerio.load(html);
                    //means we reached links results
                    if ($(linksResultSelector).length > 0){
                        var resCount = parseInt($(linksResultSelector).text().match(/\d+/)[0]);
                        //means nothing found
                        if (resCount === 0){
                            callback(true, null);
                        }
                        //means we found few results
                        else{
                            var linkToScrape = url + $(linkSelector).attr('href');
                            scrapeLink(linkToScrape, callback);
                        }
                    }
                    //means we reached directly to location weather
                    else {
                        getInfo(cityScrapeUrl, html, callback);
                    }
                }
            });
        }

    }
}