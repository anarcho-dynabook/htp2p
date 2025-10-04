import { createLibp2p } from "libp2p";
import { lpStream } from "@libp2p/utils";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { toString } from "uint8arrays/to-string";
import { multiaddr } from "@multiformats/multiaddr";

const PROTOCOL = "/htp2p/0.0.1";

export const Htp2p = {
  serve: async function htp2p(routing) {
    const node = await createLibp2p({
      addresses: { listen: ["/ip4/0.0.0.0/tcp/0"] },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncrypters: [noise()],
    });

    // Handle incoming requests
    node.handle(PROTOCOL, async (stream) => {
      const lp = lpStream(stream);
      const request = toString((await lp.read()).subarray());
      const [path, args] = [
        request.split(" ")[0],
        request.split(" ").slice(1).join(", "),
      ];

      let response;
      try {
        const value = eval(`routing.${path}(${args})`);
        response = "200\n" + value.toString();
        console.info(`200 [GET] OK "${request}"`);
      } catch {
        response = "404";
        console.info(`404 [GET] Not Found "${request}"`);
      }
      lp.write(new TextEncoder().encode(response));
    });

    await node.start();
    console.log("# Listening on addresses:");
    node.getMultiaddrs().forEach((addr) => console.log(" -", addr.toString()));
  },

  get: async function (peerAddr, path) {
    const node = await createLibp2p({
      addresses: { listen: ["/ip4/0.0.0.0/tcp/0"] },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncrypters: [noise()],
    });

    await node.start();
    const ma = multiaddr(peerAddr);
    const lp = lpStream(await node.dialProtocol(ma, PROTOCOL));

    lp.write(new TextEncoder().encode(path));
    const message = await lp.read();
    return toString(message.subarray());
  },
};
