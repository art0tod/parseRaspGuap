const fs = require('fs')
const puppeteer = require('puppeteer')

const debugInfo = {
  timestamp: new Date().toISOString(),
  architecture: process.arch,
  platform: process.platform,
}

const URL = 'https://guap.ru/rasp/'

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(URL)

  // Get a list of all groups
  const groups = await page.evaluate(() => {
    const selectElement = document.querySelector(
      'select[name="ctl00$cphMain$ctl05"]'
    )
    const options = Array.from(selectElement.options)
    return options.map(option => ({ value: option.value, text: option.text }))
  })

  // Display the list of groups to be selected
  console.log('List of groups: ')
  groups.forEach(group => console.log(`${group.text} (${group.value})`))

  // Waiting for user input to select a group
  const chosenGroupNumber = await new Promise(resolve => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    readline.question('Enter the group number: ', answer => {
      resolve(answer)
      readline.close()
    })
  })

  // Search for the code of the selected group by number
  const selectedGroup = groups.find(group => group.text === chosenGroupNumber)

  if (selectedGroup) {
    // Go to the schedule page of the selected group
    await page.goto(`https://guap.ru/rasp/?g=${selectedGroup.value}`)

    const schedule = await page.evaluate(() => {
      const days = [
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
        'Воскресенье',
      ]
      const schedule = {}

      days.forEach(day => {
        schedule[day] = []

        const dayHeaders = Array.from(document.querySelectorAll('h3'))
        const dayHeader = dayHeaders.find(header =>
          header.textContent.includes(day)
        )

        if (dayHeader) {
          let nextElement = dayHeader.nextElementSibling

          while (nextElement && nextElement.tagName !== 'H3') {
            if (nextElement.classList.contains('study')) {
              const time = nextElement.previousElementSibling.textContent.trim()
              const typeElement = nextElement.querySelector('b.up, b.dn')
              const type = typeElement
                ? typeElement.classList.contains('up')
                  ? 'на нечётной'
                  : 'на чётной'
                : 'на каждой'
              const titleElement = nextElement.querySelector('span')

              let title = titleElement ? titleElement.textContent.trim() : ''
              const titleMatch = title.match(/–\s*([^–]+)/)
              title = titleMatch ? titleMatch[1].trim() : ''

              const location = nextElement
                .querySelector('em')
                .textContent.trim()

              const prepLink = nextElement.querySelector('.preps a')
              const prep = {
                name: prepLink.textContent.trim(),
                url: prepLink.href,
              }

              const groupLinks = Array.from(
                nextElement.querySelectorAll('.groups a')
              )
              const groups = groupLinks.map(groupLink => ({
                name: groupLink.textContent.trim(),
                url: groupLink.href,
              }))

              schedule[day].push({
                time: time,
                type: type,
                title: title,
                location: location,
                prep: prep,
                groups: groups,
              })
            }

            nextElement = nextElement.nextElementSibling
          }
        }
      })

      return schedule
    })

    const data = {
      debug: debugInfo,
      schedule: schedule,
    }

    fs.writeFileSync(
      `data_${selectedGroup.value}.json`,
      JSON.stringify(data, null, 2)
    )

    console.log(`{DATA} > data_${selectedGroup.value}.json`)
  } else {
    console.log('Group not found')
  }

  await browser.close()
})()
