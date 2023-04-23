const functions = require("firebase-functions");
const line = require('./line.util');
const messages = require('./message.util');

exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {
        structuredData: true
    });
    response.send("Hello from Firebase!");
});

exports.webhook = functions.region("asia-northeast1").https.onRequest(async (req, res) => {


    if (req.method !== "POST") {
        return res.send(req.method);
    }

    if (!line.verifySignature(req.headers["x-line-signature"], req.body)) {
        return res.status(401).send("Unauthorized");
    }

    const events = req.body.events

    for (const event of events) {


        let profile = await line.getProfile(event.source.userId)

        if (event.type === "follow") {
            await line.reply(event.replyToken, [messages.text(" ดีจ้า " + profile.data.displayName)])
            return res.end();
        }
        if (event.type === "unfollow") {
            console.log("unfollow")
            return res.end();
        }
        if (event.type === "join") {
            await line.reply(event.replyToken, [messages.text(" มาแล้วจ้า")])
            return res.end();
        }
        if (event.type === "leave") {
            console.log("leave")
            return res.end();
        }

        if (event.type === "memberJoined") {
            console.log(event)
            for (let member of event.joined.members) {
                if (member.type === "user") {
                    await line.reply(event.replyToken, [messages.text(" มาแล้ว")])
                }
            }
            return res.end();
        }
        if (event.type === "memberLeft") {
            console.log("memberLeft")
            return res.end();
        }

        /* 🔥 Event Message  🔥 */
        /* https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects */

        if (event.type === "message" && event.message.type === "text") {

            if (event.message.text === "hello") {

                await line.reply(event.replyToken, [messages.text(JSON.stringify(event))])
                return res.end();
            } else if (event.message.text === "flex") {
                await line.reply(event.replyToken, [messages.demoFlex()])
                return res.end();
            } else {

                await line.postToDialogflow(req)
                return res.end();

            }

        }



    }

    return res.send(req.method);
});
exports.webhookDialogflow = functions.region("asia-northeast1").https.onRequest(async (req, res) => {

    console.log(req)

    return res.send({});
});