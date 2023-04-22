"use strict"
const functions = require("firebase-functions");
const axios = require("axios");
const crypto = require("crypto");

const LINE_MESSAGING_API = process.env.LINE_MESSAGING_API;
const LINE_ISSUE_ACCESS_TOKEN_API = process.env.LINE_ISSUE_ACCESS_TOKEN_API;
const LINE_USER_ID = process.env.LINE_USER_ID;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const DIALOGFLOW_AGENT_ID = process.env.DIALOGFLOW_AGENT_ID;

const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
};


exports.getProfile = (userId) => {
    return axios({
        method: 'get',
        headers: LINE_HEADER,
        url: `${LINE_MESSAGING_API}/profile/${userId}`
    });
};

exports.getProfileGroup = (groupId, userId) => {
    return axios({
        method: 'get',
        headers: LINE_HEADER,
        url: `${LINE_MESSAGING_API}/group/${groupId}/member/${userId}`
    });
};

exports.getGroupChatSummary = (groupId) => {
    return axios({
        method: 'get',
        headers: LINE_HEADER,
        url: `${LINE_MESSAGING_API}/group/${groupId}/summary`
    });
};

exports.getProfileRoom = (roomId, userId) => {
    return axios({
        method: 'get',
        headers: LINE_HEADER,
        url: `${LINE_MESSAGING_API}/room/${roomId}/member/${userId}`
    });
};

exports.reply = (token, payload) => {
    return axios({
        method: "post",
        url: `${LINE_MESSAGING_API}/message/reply`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            replyToken: token,
            messages: payload
        })
    });
};

exports.push = (targetId, payload) => {
    return axios({
        method: "post",
        url: `${LINE_MESSAGING_API}/message/push`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            to: targetId,
            messages: payload
        })
    });
};

exports.multicast = (payload) => {
    return axios({
        method: "post",
        url: `${LINE_MESSAGING_API}/message/multicast`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            to: [LINE_USER_ID],
            messages: payload
        })
    });
};

exports.broadcast = (payload) => {
    return axios({
        method: "post",
        url: `${LINE_MESSAGING_API}/message/broadcast`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            messages: payload
        })
    });
};


exports.postToDialogflow = async (req) => {
    req.headers.host = "dialogflow.cloud.google.com";
    return axios({
        url: `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${DIALOGFLOW_AGENT_ID}`,
        headers: req.headers,
        method: "post",
        data: req.body
    });
};

exports.verifySignature = (originalSignature, body) => {
    let text = JSON.stringify(body);
    text = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, (e) => {
        return "\\u" + e.charCodeAt(0).toString(16).toUpperCase() + "\\u" + e.charCodeAt(1).toString(16).toUpperCase();
    });
    const signature = crypto.createHmac("SHA256", LINE_CHANNEL_SECRET).update(text).digest("base64").toString();
    if (signature !== originalSignature) {
        functions.logger.error("Unauthorized");
        return false;
    }
    return true;
};


