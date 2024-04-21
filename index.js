import puppeteer from "puppeteer";
import fs from "fs";

const URL = "https://guap.ru/rasp/?g=323";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);

  const schedule = await page.evaluate(() => {
    const days = [
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
      "Воскресенье",
    ];
    const schedule = {};

    days.forEach((day) => {
      schedule[day] = [];

      const dayHeaders = Array.from(document.querySelectorAll("h3"));
      const dayHeader = dayHeaders.find((header) =>
        header.textContent.includes(day),
      );

      if (dayHeader) {
        let nextElement = dayHeader.nextElementSibling;

        while (nextElement && nextElement.tagName !== "H3") {
          if (nextElement.classList.contains("study")) {
            const time = nextElement.previousElementSibling.textContent.trim();
            const type = nextElement.querySelector("b").textContent.trim();
            const titleElement = nextElement.querySelector("span");

            let title = titleElement ? titleElement.textContent.trim() : "";
            const titleMatch = title.match(/–\s*([^–]+)/);
            title = titleMatch ? titleMatch[1].trim() : "";

            const location = nextElement.querySelector("em").textContent.trim();

            const prepLink = nextElement.querySelector(".preps a");
            const prep = {
              name: prepLink.textContent.trim(),
              url: prepLink.href,
            };

            const groupLink = nextElement.querySelector(".groups a");
            const group = {
              name: groupLink.textContent.trim(),
              url: groupLink.href,
            };

            schedule[day].push({
              time: time,
              type: type,
              title: title,
              location: location,
              prep: prep,
              group: group,
            });
          }

          nextElement = nextElement.nextElementSibling;
        }
      }
    });

    return schedule;
  });

  await browser.close();

  fs.writeFileSync("data.json", JSON.stringify(schedule, null, 2));

  console.log("DATA > data.json");
})();
