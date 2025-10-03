import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { multiaddr } from "@multiformats/multiaddr";

const PROTOCOL = "/htp2p/0.0.1";

async function startClient(peerAddr) {
  const node = await createLibp2p({
    addresses: { listen: ["/ip4/0.0.0.0/tcp/0"] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncrypters: [noise()],
  });

  await node.start();
  console.log("Client started with Peer ID:", node.peerId.toString());
  // Dial the server peer
  const ma = multiaddr(peerAddr);
  const { readBuffer } = await node.dialProtocol(ma, PROTOCOL);

  // Read data from stream
  const chunks = [];
  for await (const chunk of readBuffer) {
    chunks.push(chunk);
  }
  const fileData = Buffer.concat(chunks);

  console.log("Received content:\n", fileData.toString());
}

const peerAddr = process.argv[2];
if (!peerAddr) {
  console.error("Please provide the server multiaddr with Peer ID.");
  process.exit(1);
}

startClient(peerAddr);
