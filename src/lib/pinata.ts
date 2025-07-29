import { PinataSDK } from "pinata";

export const pinataClient = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: "gateway.pinata.cloud",
});
