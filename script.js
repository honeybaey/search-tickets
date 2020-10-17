const formSearch = document.querySelector(".form-search"),
  inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
  dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
  inputCitiesTo = formSearch.querySelector(".input__cities-to"),
  dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
  inputDateDepart = formSearch.querySelector(".input__date-depart"),
  cheapestTicket = document.getElementById("cheapest-ticket"),
  cheapTickets = document.getElementById("cheap-tickets");

// const citiesApi = "http://api.travelpayouts.com/data/ru/cities.json";
const citiesApi = "dataForm/cities.json",
  calendar = "http://min-prices.aviasales.ru/calendar_preload",
  proxy = "https://cors-anywhere.herokuapp.com/",
  apiKey = "5cea2ec1cf27ceda36488a8eae101b8b",
  maxTickets = 10;

let cities = [];

const getData = (url, callback, reject) => {
  const request = new XMLHttpRequest();

  request.open("GET", url);
  request.addEventListener("readystatechange", () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      reject(request.status);
    }
  });
  request.send();
};

const showCity = (input, list) => {
  list.textContent = "";

  if (input.value !== "") {
    const filterCity = cities.filter((item) => {
      const fixItem = item.name.toLowerCase();
      return fixItem.includes(input.value.toLowerCase());
    });
    filterCity.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("dropdown__city");
      li.textContent = item.name;
      list.append(li);
    });
  }
};

const selectCity = (e, input, list) => {
  if (e.target.tagName.toLowerCase() === "li") {
    input.value = e.target.textContent;
    list.textContent = "";
  }
};

// Рендерит количество пересадок на карточке билета
const getChanges = (num) => {
  if (num) {
    return num === 1 ? "С одной пересадкой" : "с двумя пересадками";
  } else {
    return "Без пересадок";
  }
};

// Рендерит названия городов на карточке билета
const getCityName = (code) => {
  const objCity = cities.find((item) => item.code === code);
  return objCity.name;
};

// Рендерит дату на карточке билета
const getDate = (date) => {
  return new Date(date).toLocaleString("ru", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

// Генерирует ссылку на этот рейс
const getLink = (data) => {
  const date = new Date(data.depart_date);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const dayStr = day < 10 ? `0${day}` : day;
  const monthStr = month < 10 ? `0${month}` : month;

  let link = `https://www.aviasales.ru/search/${data.origin}${dayStr}${monthStr}${data.destination}1`;

  return link;
};

// Создает блок с билетами
const createCard = (data) => {
  const ticket = document.createElement("article");
  ticket.classList.add("ticket");

  let fragment = "";

  if (data) {
    fragment = `
      <h3 class="agent">${data.gate}</h3>
      <div class="ticket__wrapper">
        <div class="left-side">
          <a target="_blank" href=${getLink(
            data
          )} class="button button__buy">Купить
            за ${data.value}&nbsp;₽</a>
        </div>
        <div class="right-side">
          <div class="block-left">
            <div class="city__from">Город отправления:
              <span class="city__name">${getCityName(data.origin)}</span>
            </div>
            <div class="date">${getDate(data.depart_date)}</div>
          </div>
      
          <div class="block-right">
            <div class="city__to">Город назначения:
              <span class="city__name">${getCityName(data.destination)}</span>
            </div>
            <div class="changes">${getChanges(data.number_of_changes)}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    fragment = "<h3>К сожалению на выбранную дату билеты отсутствуют</h3>";
  }

  ticket.insertAdjacentHTML("afterbegin", fragment);

  return ticket;
};

// Рендерит блок с самым выгодным билетом на дату
const renderTicketDay = (ticketsDay) => {
  cheapestTicket.style.display = "block";
  cheapestTicket.innerHTML = "<h2>Самый выгодный билет на выбранную дату</h2>";

  const ticketCard = createCard(ticketsDay[0]);
  cheapestTicket.append(ticketCard);
};

// Рендерит блок со списком выгодных билетов на другие даты
const renderTicketAll = (ticketsAll) => {
  cheapTickets.style.display = "block";
  cheapTickets.innerHTML = "<h2>Самые выгодные билеты на другие даты</h2>";

  ticketsAll.sort((a, b) => a.value - b.value);

  for (let i = 0; i < ticketsAll.length && i < maxTickets; i++) {
    const ticket = createCard(ticketsAll[i]);
    cheapTickets.append(ticket);
  }
};

const renderCheap = (data, date) => {
  const cheapTicketAll = JSON.parse(data).best_prices;
  const cheapTicketDay = cheapTicketAll.filter((item) => {
    return item.depart_date === date;
  });

  renderCheapDay(cheapTicketDay);
  renderCheapAll(cheapTicketAll);
};

inputCitiesFrom.addEventListener("input", () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener("input", () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener("click", (e) => {
  selectCity(e, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener("click", (e) => {
  selectCity(e, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    from: cities.find((item) => inputCitiesFrom.value === item.name).code,
    to: cities.find((item) => inputCitiesTo.value === item.name).code,
    date: inputDateDepart.value,
  };

  const requestData = `?depart_date=${formData.date}&origin=${formData.from}&destination=${formData.to}&one_way=true&token=${apiKey}`;

  getData(calendar + requestData, (response) => {
    renderCheap(response, formData.date);
  });
});

getData(proxy + citiesApi, (data) => {
  cities = JSON.parse(data).filter((item) => item.name);
});
