const http = require("http");
const fs = require("fs");
const requests = require("requests");

const homeFile = fs.readFileSync("./home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  if (!orgVal.main || !orgVal.sys || !orgVal.weather) {
    console.error("Unexpected API response:", orgVal);
    return tempVal
      .replace("{%tempval%}", "N/A")
      .replace("{%tempmin%}", "N/A")
      .replace("{%tempmax%}", "N/A")
      .replace("{%location%}", "Not Found")
      .replace("{%country%}", "")
      .replace("{%tempStatus%}", "Unknown");
  }

  let temprature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temprature = temprature.replace("{%tempmin%}", orgVal.main.temp_min);
  temprature = temprature.replace("{%tempmax%}", orgVal.main.temp_max);
  temprature = temprature.replace("{%location%}", orgVal.name);
  temprature = temprature.replace("{%country%}", orgVal.sys.country);
  temprature = temprature.replace("{%tempStatus%}", orgVal.weather[0].main);
  return temprature;
};


const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, "http://localhost:8000");
  const city = urlObj.searchParams.get("q") || "Sonipat";

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d25e6312d661af056132c9295b67d578&units=imperial`;

  if (req.url.startsWith("/")) {
    requests(apiUrl)
      .on("data", function (chunk) {
        const obj = JSON.parse(chunk);
        const arrData = [obj];
        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join("");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(realTimeData);
      })
      .on("end", function (err) {
        if (err) console.log("connection closed due to errors", err);
        res.end();
      });
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening on http://localhost:8000");
});
