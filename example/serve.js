import { Htp2p } from "../htp2p.js";

Htp2p.serve({
  index: () => "Hello, world!",
  name: () => "Remilia Darknets",
  calc: {
    inc: (n) => n + 1,
    add: (a, b) => a + b,
  },
});
