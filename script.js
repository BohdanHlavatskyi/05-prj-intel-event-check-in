var ATTENDANCE_GOAL = 50;
var STORAGE_KEY = "intel-check-in-data";

var attendeeCountElement = document.getElementById("attendeeCount");
var progressBarElement = document.getElementById("progressBar");
var greetingElement = document.getElementById("greeting");
var celebrationBannerElement = document.getElementById("celebrationBanner");
var attendeeListElement = document.getElementById("attendeeList");

var teamCountElements = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};

var teamCardElements = {
  water: document.querySelector(".team-card.water"),
  zero: document.querySelector(".team-card.zero"),
  power: document.querySelector(".team-card.power"),
};

var teamLabels = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

var state = {
  attendees: [],
};

function loadState() {
  var savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    try {
      state = JSON.parse(savedData);
      if (!state.attendees || !Array.isArray(state.attendees)) {
        state = { attendees: [] };
      }
    } catch (error) {
      state = { attendees: [] };
    }
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTeamCounts() {
  var counts = {
    water: 0,
    zero: 0,
    power: 0,
  };

  for (var i = 0; i < state.attendees.length; i += 1) {
    if (counts.hasOwnProperty(state.attendees[i].team)) {
      counts[state.attendees[i].team] += 1;
    }
  }

  return counts;
}

function getWinningTeams(counts) {
  var highestCount = 0;
  var winners = [];

  for (var team in counts) {
    if (counts[team] > highestCount) {
      highestCount = counts[team];
      winners = [team];
    } else if (counts[team] === highestCount && highestCount > 0) {
      winners.push(team);
    }
  }

  return winners;
}

function renderAttendees() {
  attendeeListElement.innerHTML = "";

  if (state.attendees.length === 0) {
    var emptyMessage = document.createElement("li");
    emptyMessage.className = "attendee-empty";
    emptyMessage.textContent = "No attendees checked in yet.";
    attendeeListElement.appendChild(emptyMessage);
    return;
  }

  for (var i = 0; i < state.attendees.length; i += 1) {
    var attendee = state.attendees[i];
    var listItem = document.createElement("li");
    listItem.className = "attendee-item";

    var nameSpan = document.createElement("span");
    nameSpan.className = "attendee-name";
    nameSpan.textContent = attendee.name;

    var teamSpan = document.createElement("span");
    teamSpan.className = "attendee-team " + attendee.team;
    teamSpan.textContent = teamLabels[attendee.team] || "Unknown Team";

    listItem.appendChild(nameSpan);
    listItem.appendChild(teamSpan);
    attendeeListElement.appendChild(listItem);
  }
}

function renderCounts() {
  var counts = getTeamCounts();
  var totalCount = state.attendees.length;
  var progressPercent = Math.min((totalCount / ATTENDANCE_GOAL) * 100, 100);
  var winners = getWinningTeams(counts);

  attendeeCountElement.textContent = totalCount;
  progressBarElement.style.width = progressPercent + "%";

  teamCountElements.water.textContent = counts.water;
  teamCountElements.zero.textContent = counts.zero;
  teamCountElements.power.textContent = counts.power;

  teamCardElements.water.classList.remove("winning-team");
  teamCardElements.zero.classList.remove("winning-team");
  teamCardElements.power.classList.remove("winning-team");

  for (var i = 0; i < winners.length; i += 1) {
    teamCardElements[winners[i]].classList.add("winning-team");
  }

  if (totalCount >= ATTENDANCE_GOAL && winners.length > 0) {
    celebrationBannerElement.textContent =
      "Celebration! The attendance goal has been reached, and " +
      getWinningTeamMessage(winners) +
      (winners.length === 1 ? " is leading." : " are leading.");
    celebrationBannerElement.classList.add("show");
  } else {
    celebrationBannerElement.textContent = "";
    celebrationBannerElement.classList.remove("show");
  }
}

function getWinningTeamMessage(winners) {
  if (winners.length === 1) {
    return teamLabels[winners[0]];
  }

  if (winners.length === 2) {
    return teamLabels[winners[0]] + " and " + teamLabels[winners[1]];
  }

  return (
    teamLabels[winners[0]] +
    ", " +
    teamLabels[winners[1]] +
    ", and " +
    teamLabels[winners[2]]
  );
}

function renderAll() {
  renderCounts();
  renderAttendees();
}

function showGreeting(name, team) {
  greetingElement.style.display = "block";
  greetingElement.classList.add("success-message");
  greetingElement.textContent =
    "Welcome, " + name + "! You are checked in with " + teamLabels[team] + ".";
}

function handleSubmit(event) {
  var form = event.target;
  var nameInput = document.getElementById("attendeeName");
  var teamSelect = document.getElementById("teamSelect");
  var attendeeName = nameInput.value.trim();
  var teamValue = teamSelect.value;

  event.preventDefault();

  if (!attendeeName || !teamValue) {
    return;
  }

  state.attendees.push({
    name: attendeeName,
    team: teamValue,
  });

  saveState();
  renderAll();
  showGreeting(attendeeName, teamValue);

  form.reset();
  nameInput.focus();
}

function init() {
  var checkInForm = document.getElementById("checkInForm");

  loadState();
  renderAll();
  checkInForm.addEventListener("submit", handleSubmit);
}

init();
