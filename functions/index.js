const functions = require("firebase-functions");
const line = require('./line.util');
const messages = require('./message.util');

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
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


        functions.logger.info(JSON.stringify(event.message), {
            structuredData: true
        });


        /* 🔥 Event Message  🔥 */
        /* https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects */

        await line.reply(event.replyToken, [messages.text(JSON.stringify(event.message))])
        return res.end();

    }

    return res.send(req.method);
});