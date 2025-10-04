import { createLibp2p } from "libp2p";
import { lpStream } from "@libp2p/utils";
import { tcp } from "@libp2p/tcp";
import { identify } from "@libp2p/identify";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { toString } from "uint8arrays/to-string";
import { kadDHT } from "@libp2p/kad-dht";
import { ping } from "@libp2p/ping";
import { multiaddr } from "@multiformats/multiaddr";

const PROTOCOL = "/htp2p/0.0.1";
const CONFIG = {
  addresses: { listen: ["/ip4/0.0.0.0/tcp/0"] },
  transports: [tcp()],
  streamMuxers: [mplex()],
  connectionEncrypters: [noise()],
  services: {
    dht: kadDHT({ clientMode: false }),
    identify: identify(),
    ping: ping(),
  },
};

async function publishName(node, name) {
  const key = new TextEncoder().encode(`name:${name}`);
  const addr = node.getMultiaddrs()[0].toString();
  const value = new TextEncoder().encode(addr);
  await node.services.dht.put(key, value);
  console.log(`Published "${name}" -> ${addr}`);
}

async function resolveName(node, name) {
  const key = new TextEncoder().encode(`name:${name}`);
  const value = await node.services.dht.get(key);
  return toString(value);
}

export const Htp2p = {
  serve: async function htp2p(routing) {
    const node = await createLibp2p(CONFIG);

    // Handle incoming requests
    node.handle(PROTOCOL, async (stream) => {
      const lp = lpStream(stream);
      const request = toString((await lp.read()).subarray());
      const [path, args] = [
        request.split(" ")[0],
        request.split(" ").slice(1).join(", "),
      ];

      let response = (() => {
        try {
          const value = eval(`routing.${path}(${args})`);
          console.info(`200 [GET] OK "${request}"`);
          return "200\n" + value.toString();
        } catch {
          console.info(`404 [GET] Not Found "${request}"`);
          return "404";
        }
      })();
      lp.write(new TextEncoder().encode(response));
    });

    await node.start();
    await publishName(node, "alice");

    console.log("# Listening on addresses:");
    node.getMultiaddrs().forEach((addr) => console.log(" -", addr.toString()));
  },

  get: async function (name, path) {
    const node = await createLibp2p(CONFIG);
    await node.start();

    const peerAddr = await resolveName(node, new TextEncoder().encode(name));
    console.log("Resolved Peer ID:", peerAddr.toString());

    const ma = multiaddr(peerAddr);
    const lp = lpStream(await node.dialProtocol(ma, PROTOCOL));

    lp.write(new TextEncoder().encode(path));
    const message = await lp.read();
    return toString(message.subarray());
  },
};
