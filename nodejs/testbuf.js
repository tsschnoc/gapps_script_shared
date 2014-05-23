var buf = new Buffer(4);

buf[0] = 0x3;
buf[1] = 0x4;
buf[2] = 0x23;
buf[3] = 0x42;


console.log(buf.readUInt32BE(0));
console.log(buf.readUInt32LE(0));

