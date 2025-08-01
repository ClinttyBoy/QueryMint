"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVector = exports.pinata = void 0;
const pinata_1 = require("pinata");
exports.pinata = new pinata_1.PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
    pinataGatewayKey: process.env.PINATA_GATEWAY_KEY,
});
const fetchVector = async (dataUrl) => {
    try {
        const res = await fetch(dataUrl);
        if (!res.ok)
            throw Error("Errorin fetching dataFile");
        const data = await res.json();
        // console.log(data);
        console.log("[vector data fetched]");
        return data;
    }
    catch (error) {
        console.log(error);
    }
};
exports.fetchVector = fetchVector;
