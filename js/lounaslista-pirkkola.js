(function () {
  "use strict";

  var API_KEY = "0de1f34e-c4bb-4b31-a665-b39e69355475";
  var API_URL = "https://lounastaja.app/api/v1/week/" + API_KEY + "/current";
  var LANG = "fi";

  function helsinkiDateStr() {
    return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Helsinki" });
  }

  function pickLang(obj) {
    if (!obj || typeof obj !== "object") return "";
    return obj[LANG] || obj.fi || "";
  }

  function escapeHtml(s) {
    if (s == null || s === "") return "";
    var div = document.createElement("div");
    div.textContent = String(s);
    return div.innerHTML;
  }

  function renderAllergens(allergens) {
    if (!allergens || !allergens.length) return "";
    var parts = [];
    for (var i = 0; i < allergens.length; i++) {
      var abbr = pickLang(allergens[i].abbreviation) || pickLang(allergens[i].title);
      if (abbr) parts.push("<span class=\"lounas-split__badge\">" + escapeHtml(abbr) + "</span>");
    }
    return parts.length ? "<div class=\"lounas-split__badges\">" + parts.join("") + "</div>" : "";
  }

  function renderLunchList(lunches) {
    if (!lunches || !lunches.length) {
      return "<p class=\"lounas-split__empty\">Ei listattuja annoksia.</p>";
    }
    var html = "<ul class=\"lounas-split__list\">";
    for (var i = 0; i < lunches.length; i++) {
      var item = lunches[i];
      var title = pickLang(item.title);
      var desc = pickLang(item.description);
      html += "<li class=\"lounas-split__item\">";
      html += "<p class=\"lounas-split__dish\">" + escapeHtml(title) + "</p>";
      html += renderAllergens(item.allergens);
      if (desc) html += "<p class=\"lounas-split__desc\">" + escapeHtml(desc) + "</p>";
      html += "</li>";
    }
    html += "</ul>";
    return html;
  }

  function renderClosedDay(day) {
    var text = pickLang(day.closedText);
    return "<p class=\"lounas-split__closed\">" + escapeHtml(text || "Suljettu") + "</p>";
  }

  function sortDayOrder(a, b) {
    function key(dn) {
      return dn === 0 ? 7 : dn;
    }
    return key(a.dayNumber) - key(b.dayNumber);
  }

  function findDayByDate(days, dateStr) {
    for (var i = 0; i < days.length; i++) {
      if (days[i].dateString === dateStr) return days[i];
    }
    return null;
  }

  function renderDayBlock(day) {
    var name = pickLang(day.dayName);
    var label = escapeHtml(name);
    if (day.dateString) label += " · " + escapeHtml(day.dateString);
    var inner = "";
    if (day.isClosed) inner = renderClosedDay(day);
    else if (day.isHidden) inner = "<p class=\"lounas-split__empty\">Ei julkaistu.</p>";
    else inner = renderLunchList(day.lunches);
    return (
      "<section class=\"lounas-split__day-block\" aria-labelledby=\"lounas-day-" +
      escapeHtml(String(day.dayNumber)) +
      "\">" +
      "<h4 class=\"lounas-split__day-name\" id=\"lounas-day-" +
      escapeHtml(String(day.dayNumber)) +
      "\">" +
      label +
      "</h4>" +
      inner +
      "</section>"
    );
  }

  function init() {
    var todayBody = document.getElementById("lounas-today-body");
    var restBody = document.getElementById("lounas-rest-body");
    var metaEl = document.getElementById("lounas-week-meta");
    var msgEl = document.getElementById("lounas-week-msg");
    if (!todayBody || !restBody) return;

    fetch(API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        if (!json.success || !json.data || !json.data.week) throw new Error("no week");
        var week = json.data.week;
        var days = week.days || [];
        var todayStr = helsinkiDateStr();

        if (metaEl && week.dateRange) {
          metaEl.textContent = week.dateRange;
          metaEl.removeAttribute("hidden");
        }
        if (msgEl && week.messageOfTheWeek) {
          var motw = pickLang(week.messageOfTheWeek);
          if (motw) {
            msgEl.textContent = motw;
            msgEl.removeAttribute("hidden");
          }
        }

        var todayDay = findDayByDate(days, todayStr);
        var sorted = days.slice().sort(sortDayOrder);

        if (todayDay && !todayDay.isHidden) {
          if (todayDay.isClosed) {
            todayBody.innerHTML = renderClosedDay(todayDay);
          } else {
            todayBody.innerHTML = renderLunchList(todayDay.lunches);
          }
        } else if (todayDay && todayDay.isHidden) {
          todayBody.innerHTML =
            "<p class=\"lounas-split__empty\">Tämän päivän listaa ei ole julkaistu.</p>";
        } else {
          todayBody.innerHTML =
            "<p class=\"lounas-split__empty\">Tälle päivälle ei löytynyt julkaistua listaa. Katso oikealta koko viikko.</p>";
        }

        var others = sorted.filter(function (d) {
          if (d.isHidden) return false;
          if (todayDay && !todayDay.isHidden && d.dateString === todayStr) return false;
          return true;
        });

        if (!others.length) {
          restBody.innerHTML = "<p class=\"lounas-split__empty\">Ei muita päiviä.</p>";
          return;
        }

        var parts = [];
        for (var j = 0; j < others.length; j++) {
          parts.push(renderDayBlock(others[j]));
        }
        restBody.innerHTML = parts.join("");
      })
      .catch(function () {
        todayBody.innerHTML =
          "<p class=\"lounas-split__error\">Listaa ei voitu ladata. <a href=\"https://lounas.app/lounaslista/janin-lounas\" target=\"_blank\" rel=\"noopener\">Avaa lounaslista Lounas.appissa</a></p>";
        restBody.innerHTML = "";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
