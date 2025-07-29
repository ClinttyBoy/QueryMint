import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
  pinataGatewayKey: process.env.PINATA_GATEWAY_KEY,
});

export const fetchVector = async (dataUrl: string) => {
  try {
    const res = await fetch(dataUrl);

    if (!res.ok) throw Error("Errorin fetching dataFile");
    const data = await res.json();
    console.log("[vector dat fetched]");
    return data;
  } catch (error) {
    console.log(error);
  }
};
