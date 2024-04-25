fetch('../data_323.json')
  .then(response => response.json())
  .then(data => {
    console.log(data.debug)
    let schedule = document.getElementById('schedule')
    data = data.schedule
    for (let day in data) {
      if (data.hasOwnProperty(day)) {
        let dayItem = document.createElement('li')
        dayItem.classList.add('day')
        dayItem.innerHTML = `<h2 class="day-name">${day}</h2>`
        data[day].forEach(item => {
          let sessionDiv = document.createElement('div')
          sessionDiv.classList.add('session')
          sessionDiv.innerHTML = `
                        <p class="day-card__time"><span class="day-card__accent">Time:</span> ${
                          item.time
                        }</p>
                        <p class="day-card__type"><span class="day-card__accent">Type:</span> ${
                          item.type
                        }</p>
                        <p class="day-card__title"><span class="day-card__accent">Title:</span> ${
                          item.title
                        }</p>
                        <p class="day-card__location"><span class="day-card__accent">Location:</span> ${
                          item.location
                        }</p>
                        <p class="day-card__prep"><span>Prep:</span> <a href="${
                          item.prep.url
                        }" target="_blank">${item.prep.name}</a></p>
                        <p class="day-card__groups"><span>Groups:</span> 
                            <ul>
                                ${item.groups
                                  .map(
                                    group =>
                                      `<li><a href="${group.url}" target="_blank">${group.name}</a></li>`
                                  )
                                  .join('')}
                            </ul>
                        </p>
                    `
          dayItem.appendChild(sessionDiv)
        })
        schedule.appendChild(dayItem)
      }
    }
  })
  .catch(error => {
    console.error('Error:', error)
  })
