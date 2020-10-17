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

const getData = (url, callback) => {
  const request = new XMLHttpRequest();

  request.open("GET", url);
  request.addEventListener("readystatechange", () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      console.error(request.status);
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

const renderCheapDay = (ticketsDay) => {
  console.log(ticketsDay);
};

const renderCheapAll = (ticketsAll) => {
  console.log(ticketsAll);
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
