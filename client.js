import { createLibp2p } from "libp2p";
import { lpStream } from "@libp2p/utils";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { toString } from "uint8arrays/to-string";
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
  const ma = multiaddr(peerAddr);
  const lp = lpStream(await node.dialProtocol(ma, PROTOCOL));

  Promise.resolve().then(async () => {
    while (true) {
      const message = await lp.read();
      const text = toString(message.subarray()).replaceAll("\n", " ");
      console.log(`[${new Date().toISOString()}] ${text}`);
    }
  });
}

const peerAddr = process.argv[2];
if (!peerAddr) {
  console.error("[ERROR] Server multiaddr is not provided");
  process.exit(1);
}

startClient(peerAddr);
