import { Htp2p } from "../htp2p.js";

const peerAddr = process.argv[2];
const path = process.argv[3] ?? "index";
if (!peerAddr) {
  console.log("HTP2P curl");
  console.error("error: server multiaddr is not provided");
  process.exit(1);
}

console.log(await Htp2p.get(peerAddr, path));
process.exit(1);
