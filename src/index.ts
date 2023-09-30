import { createServer } from "http";
import { stat, createReadStream } from "fs";
import { promisify } from "util";

const fileInto = promisify(stat);

const filename = "./video/framer.mp4";

createServer(async (req, res) => {
	const { size } = await fileInto(filename);
	const range = req.headers.range;
	if (range) {
		let [start, end] = range.replace("/bytes=/", "").split("-");
		const startOF = parseInt(start, 10);
		const endOF = end ? parseInt(end, 10) : size - 1;
		res.writeHead(206, {
			"Content-Range": `bytes ${startOF}-${endOF}/${size}`,
			"Accept-Ranges": "bytes",
			"Content-Length": startOF - endOF + 1,
			"Content-Type": "video/mp4"
		});
		createReadStream(filename, { start: startOF, end: endOF }).pipe(res);
	}
	res.writeHead(200, {
		"Content-Length": size,
		"Content-Type": "video/mp4"
	});

	createReadStream(filename).pipe(res);
}).listen(3000, () => console.log("server is listening on port 3000"));
