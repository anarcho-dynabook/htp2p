import { createLibp2p } from "libp2p";
import { lpStream } from "@libp2p/utils";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";

const PROTOCOL = "/htp2p/0.0.1";

async function startServer(filePath) {
  const node = await createLibp2p({
    addresses: { listen: ["/ip4/0.0.0.0/tcp/0"] },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncrypters: [noise()],
  });

  // Handle incoming file requests
  node.handle(PROTOCOL, async (stream) => {
    const lp = lpStream(stream);
    process.stdin.addListener("data", (buf) => lp.write(buf));
  });

  await node.start();
  console.log("# Listening on addresses:");
  node.getMultiaddrs().forEach((addr) => console.log(" -", addr.toString()));
}

startServer();
