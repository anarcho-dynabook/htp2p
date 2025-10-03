import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { readFileSync } from "node:fs";

const PROTOCOL = "/htp2p/0.0.1";

async function startServer() {
  const node = await createLibp2p({
    addresses: { listen: ["/ip4/0.0.0.0/tcp/0"] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncrypters: [noise()],
  });

  // Handle incoming file requests
  node.handle(PROTOCOL, async ({ writeBuffer }) => {
    console.log("[INFO] incoming request!");
    let value = "Hello";
    try {
      writeBuffer = new TextEncoder().encode(value);
      console.log("Response sent!");
    } catch (err) {
      console.error("Sink error:", err);
    }
    writeBuffer.close();
    console.log("[INFO] Response sent!");
  });

  await node.start();
  console.log("Server started with Peer ID:", node.peerId.toString());
  console.log("Listening on addresses:");
  node.getMultiaddrs().forEach((addr) => console.log(addr.toString()));
}

startServer();
