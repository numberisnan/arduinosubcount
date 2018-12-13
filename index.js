const five = require("johnny-five")
const fs = require('fs')
const rp = require('request-promise-native')
const config = require('./config')

const board = five.Board()

console.log("Reading youtube.key ...")
const apikey = String(fs.readFileSync('youtube.key'))
const channelId = process.argv[2]

async function getData() {
    console.log("Requesting sub count ...")
    return await rp('https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id='+ channelId +'&key=' + apikey)
        .then(async function(res) {
            var parsedData = JSON.parse(res)
            return Number(parsedData.items[0].statistics.subscriberCount)
        })
}

function main() {
    var servo = new five.Servo({
        pin: 10,
        startAt: 0
    });

    servo.min()

    setInterval(async function updateCount() {
        var subs = await getData()
        var deg = ((subs - config.settings.dialRange[0]) / (config.settings.dialRange[1] - config.settings.dialRange[0])) * 180
        console.log(subs, deg)
        servo.to(deg)
    }, config.settings.requestInterval)
}

board.on("ready", main)






