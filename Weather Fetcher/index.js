// Sign up for a free weather API — OpenWeatherMap is the most commonly used for learning. Get your API key from their dashboard. In your project, run npm install dotenv, create a .env file containing something like OPENWEATHER_API_KEY=yourkeyhere, and add .env to a .gitignore file so it never gets committed. At the top of index.js, add import 'dotenv/config'; to load it.

import 'dotenv/config';
const API_KEY = process.env.OPENWEATHER_API_KEY;

// You've done this exact thing in Project 1. Reuse the same process.argv.slice(2) pattern to capture what the user typed after `node index.js`. Decide what should happen if they run the program with no city name at all — you already know this pattern from addTask's empty-description guard.

const args = process.argv.slice(2);

if(args.length === 0) {
    console.log("Add city name in command.");
    process.exitCode = 1;
    process.exit();
}
// Look up OpenWeatherMap's documentation for their 'current weather' endpoint — you'll need to build a URL that includes the city name and your API key as query parameters. Use fetch() (built into modern Node, no install needed) inside an async function, and await the response. Don't parse anything yet — just get the raw response back and console.log it to see what you're working with.
// fetch() doesn't throw an error for a bad response (like an invalid city or bad API key) the way you might expect — it only throws on true network failures. Check response.ok or response.status yourself before trusting the data. If it's not ok, handle that case explicitly rather than letting bad data flow through. If it is ok, call response.json() (which is itself async — don't forget await) to get the actual data.

const cityName = args.join(" ");

async function getData() {

    let response;
    try {
        response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
    } catch(err) {
        console.log("Error getting response: ", err);
        throw err;
    }

    if(!response.ok) {
        console.error(`Something went wrong \n Status code ${response.status}. Check that the city name is correct`);
    } else {
        const parsedData = await response.json();
        console.log(`City Name: ${parsedData.name}`);
        console.log(`Temperature: ${parsedData.main.temp} degree Celsius`);
        console.log(`Feels Like: ${parsedData.main.feels_like}`);
        console.log(`Description: ${parsedData.weather[0].description}`)
    }
}

// Console.log the full parsed object first. Real APIs nest data in ways you won't guess — temperature might be under something like data.main.temp, conditions under data.weather[0].description. Find the actual fields you need by looking at the real output, not by guessing from memory or documentation alone.

// Pull out just the fields you care about and print them in a clean, readable line or two — city name, temperature, conditions. Decide on units (the API defaults to Kelvin unless you request otherwise — check their docs for the query parameter that switches to Celsius).

// Same shape as Project 1's dispatcher: an async main() function, a try/catch around the fetch-and-parse logic, process.exitCode = 1 on failure paths (city not found, network error, missing API key), and a clear error message printed to the user rather than a raw stack trace.

async function main() {
    try {
        await getData();
    } catch(err){
        console.error("Something went wrong", err);
    }
}

main();