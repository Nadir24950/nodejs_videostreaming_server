const express = require("express");
const fs = require("fs");
const app = express();


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", (req, res) => {

//ensure there is a range given for the video
    const range = req.headers.range;

    if (!range){
        res.status(400).send("Requires Range Header");
    }

    const videoPath = "bigbuck.mp4";
    const videoSize = fs.statSync(videoPath).size;

    //parse range exp = 1 - 3566 
    const CHUNK_SIZE = 10 ** 6 ; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize -1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start} - ${end}/${videoSize}`,
        "Accept-Range": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoSteam = fs.createReadStream(videoPath, { start, end });

    videoSteam.pipe(res); 
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/404.html")
});