import { createServer } from "http";
import { stat, createReadStream } from "fs";
import { promisify } from "util";

const filename = "./video/framer.mp4";

// convertiong to promise to use await syntax the stat callback
const fileInto = promisify(stat);

createServer(async (req, res) => {
	//  status of the file
	const { size } = await fileInto(filename);

	const range = req.headers.range;
	/* The `if (range)` condition checks if the `range` header is present in the request. The `range`
    header specifies the range of bytes that the client wants to receive in the response. */
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
		/*  reading the video file specified by the `filename` variable. */
		createReadStream(filename, { start: startOF, end: endOF }).pipe(res);
	}
	res.writeHead(200, {
		"Content-Length": size,
		"Content-Type": "video/mp4"
	});

	createReadStream(filename).pipe(res);
}).listen(3000, () => console.log("server is listening on port 3000"));
