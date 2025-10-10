import { Htp2p } from "../htp2p.js";

const uri = process.argv[2];
console.log(await Htp2p.get(uri));
process.exit(1);
