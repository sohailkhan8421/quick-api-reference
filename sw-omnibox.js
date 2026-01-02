chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({
      apiSuggestions: ['tabs', 'storage', 'scripting']
    });
  }
  const URL_CHROME_EXTENSIONS_DOC =
  'https://developer.chrome.com/docs/extensions/reference/';
	const NUMBER_OF_PREVIOUS_SEARCHES = 4;

	// Display the suggestions after user starts typing
	chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
	  await chrome.omnibox.setDefaultSuggestion({
	    description: 'Enter a Chrome API or choose from past searches'
	  });
	  const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
	  const suggestions = apiSuggestions.map((api) => {
	    return { content: api, description: `Open chrome.${api} API` };
	  });
	  suggest(suggestions);
	});
});

chrome.omnibox.onInputEntered.addListener((input) => {
  chrome.tabs.create({ url: URL_CHROME_EXTENSIONS_DOC + input });
  // Save the latest keyword
  updateHistory(input);
});


async function updateHistory(input) {
  const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
  apiSuggestions.unshift(input);
  apiSuggestions.splice(NUMBER_OF_PREVIOUS_SEARCHES);
  return chrome.storage.local.set({ apiSuggestions });
}


let ACTIVE_SELECTION_KEY = "b825f194-51ef-46ae-9853-4224b0c4ed1e",
    SAVED_ITINERARY = "450d1220-6126-44a6-8c9c-25287c96ee02",
    RIGHT_ITINERARY = "6ac55b83-4001-434d-9e34-674764125811",
    addButton = document.getElementById("addItinerary"),
    deleteButton = document.getElementById("delete"),
    itineraryContainer = document.getElementById("itineraries"),
    editorContainer = document.getElementById("editorContainer"),
    messageContainer = document.getElementById("messageContainer"),
    passengerContainer = document.getElementById("passengerContainer"),
    addPassengerButton = document.getElementById("addPassengerButton"),
    createKeyDocButton = document.getElementById("createKeyDoc"),
    openInTabButton = document.getElementById("openInTab"),
    addItineraryCenter = document.getElementById("addItineraryCenter"),
    googleApiKeyContainer = document.getElementById("googleApiKeyContainer"),
    timeUI = document.getElementById("timeUI");
async function loadDataFromStorage(e) {
    return new Promise((a) => {
        chrome.storage.sync.get([e], function (t) {
            t = t[e];
            try {
                a(JSON.parse(t));
            } catch (e) {
                a(t);
            }
        });
    });
}
async function saveDataInStorage(t, a) {
    return new Promise((e) => {
        chrome.storage.sync.set({ [t]: JSON.stringify(a) }, function () {
            e();
        });
    });
}
function showToast(e) {
    var t = document.getElementById("snackbar");
    (t.className = "show"),
        (t.innerText = e),
        setTimeout(function () {
            t.className = t.className.replace("show", "");
        }, 3e3);
}
function initilizeTooltip() {
    ["label", "div", "li"].forEach((e) => {
        $(e).hover(
            function () {
                var e = $(this).attr("tooltip");
                e && (this.classList.add("tooltip"), $("<span/>", { text: e, class: "tooltiptext" }).appendTo(this));
            },
            function () {
                var e = $(document).find("span.tooltiptext");
                e && e.remove(), this.classList.remove("tooltip");
            }
        );
    });
}
function computeItineraryTitle(e) {
    let t = "";
    return (
        e.train && (t += e.train),
        (e.source || e.destination) && ((t = t && t + " "), e.source && e.destination ? (t += e.source + " - " + e.destination) : (e.source || e.destination) && (t += (e.source || "") + (e.destination || ""))),
        e.date && ((t = t && t + " "), (t += e.date)),
        t || "Draft"
    );
}
function updateItemTitle(e, t) {
    (e = e.firstChild), (t = computeItineraryTitle(t));
    (e.innerText = t), e.setAttribute("tooltip", t);
}
async function addItinerary() {
    var e = await loadDataFromStorage(SAVED_ITINERARY),
        t = {
            active: !1,
            key: Date.now() + "",
            googleApiKey: "",
            username: "",
            password: "",
            source: "",
            destination: "",
            date: "",
            quota: "",
            train: "",
            mobile: "",
            seatType: "",
            paymentType: "",
            ifConfirm: "",
            passengers: [{ name: "", age: "", gender: "", preference: "", country: "", foodChoice: "" }],
        },
        a = (0 == e.length && (t.active = !0), createIteneraryHtml(t));
    itineraryContainer.insertBefore(a, itineraryContainer.firstChild), e.unshift(t), await saveDataInStorage(SAVED_ITINERARY, e), (await loadDataFromStorage(RIGHT_ITINERARY)) || updateRightSection(a);
}
function setLiItemSelected(e) {
    for (var t of itineraryContainer.children) t.classList.remove("liselected");
    e.classList.add("liselected");
}
function createSwitchControl(e, t) {
    t = jQuery.parseHTML(`<div class="noEffect">
      <label class="switch">
        <input type="checkbox" id="mySwitch" data-metadata-key="${t.key}" ${e ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    </div>`)[0];
    let r = jQuery(t).find("input")[0];
    return (
        r.addEventListener("click", async (e) => {
            var a = jQuery(itineraryContainer).find("input"),
                n = await loadDataFromStorage(SAVED_ITINERARY);
            if (e.target.checked) for (let e = 0; e < a.length; e++) a[e] != r && (a[e].checked = !1);
            let i = {};
            for (let e = 0; e < a.length; e++) {
                let t = a[e].getAttribute("data-metadata-key");
                var o = n.find((e) => e.key == t);
                (o.active = a[e].checked), o.active && (i = o);
            }
            await saveDataInStorage(SAVED_ITINERARY, n), await saveDataInStorage(ACTIVE_SELECTION_KEY, i);
        }),
        t
    );
}
function createIteneraryHtml(e) {
    let t = document.createElement("li"),
        a = document.createElement("div");
    t.appendChild(a), a.setAttribute("data-metadata-key", e.key), updateItemTitle(t, e), a.classList.add("expandWidth"), t.classList.add("apart"), t.setAttribute("data-metadata-key", e.key);
    e = createSwitchControl(!!e.active, e);
    return (
        t.appendChild(e),
        [t, a].forEach((e) =>
            e.addEventListener("click", (e) => {
                (e.target !== t && e.target !== a) || updateRightSection(t);
            })
        ),
        t
    );
}
async function renderItineraries() {
    var e = await loadDataFromStorage(SAVED_ITINERARY);
    let a;
    return (
        e && Array.isArray(e)
            ? e.forEach((e) => {
                  var t = createIteneraryHtml(e);
                  itineraryContainer.appendChild(t), e.active && (a = e);
              })
            : await saveDataInStorage(SAVED_ITINERARY, []),
        a
    );
}
function itineraryToItem(t) {
    var a = itineraryContainer.children;
    for (let e = 0; e < a.length; e++) if (a[e].getAttribute("data-metadata-key") === t) return a[e];
    return null;
}
async function saveItinerary(t) {
    var e = await loadDataFromStorage(SAVED_ITINERARY);
    saveDataInStorage(
        SAVED_ITINERARY,
        e.map((e) => (e.key == t.key ? t : e))
    ),
        t.active && saveDataInStorage(ACTIVE_SELECTION_KEY, t);
}
function createPassengerTemplate(e) {
    return jQuery.parseHTML(`<div id="passenger-${e}" class="gridLayout bottomMarginHalfRem">
    <div class="horizontalLayout">
      <label for="name-${e}" class="rightMarginHalfRem">Name:</label>
      <input type="text" id="name-${e}" name="name-${e}" class="rightMargin1rem">
      <button id="deleteButton-${e}" name="deleteButton-${e}">Delete</button>
    </div>
    <div class="horizontalLayout">
      <label for="age-${e}" class="rightMarginHalfRem">Age:</label>
      <input type="number" id="age-${e}" name="age-${e}" class="rightMargin1rem">
      <label for="gender-${e}" class="rightMarginHalfRem">Gender:</label>
      <select id="gender-${e}" name="gender-${e}">
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>
    <div class="horizontalLayout">
      <label for="country-${e}" class="rightMarginHalfRem">Country:</label>
      <input type="text" id="country-${e}" name="country-${e}" class="rightMargin1rem">
      <label for="preference-${e}" class="rightMarginHalfRem">Preference:</label>
      <select id="preference-${e}" name="preference-${e}">
        <option value="">None</option>
        <option value="No Preference">No Preference</option>
        <option value="Window Side">Window Side</option>
        <option value="Lower">Lower</option>
        <option value="Middle">Middle</option>
        <option value="Upper">Upper</option>
        <option value="Side Lower">Side Lower</option>
        <option value="Side Middle">Side Middle</option>
        <option value="Side Upper">Side Upper</option>
        <option value="Cabin">Cabin</option>
        <option value="Coupe">Coupe</option>
      </select>
    </div>
    <div class="horizontalLayout">
      <label for="foodChoice-${e}" class="rightMarginHalfRem">Catering Service Option:</label>
      <select id="foodChoice-${e}" name="foodChoice-${e}">
        <option value="">None</option>
        <option value="No Food">No Food</option>
        <option value="Veg">Veg</option>
        <option value="Non Veg">Non Veg</option>
        <option value="Jain Meal">Jain Meal</option>
        <option value="Veg (Diabetic)">Veg (Diabetic)</option>
        <option value="Non Veg (Diabetic)">Non Veg (Diabetic)</option>
      </select>
    </div>
  </div>`)[0];
}
async function updateRightSection(n) {
    if ((window.location.search.includes("mode=llm") ? googleApiKeyContainer.removeAttribute("hidden") : googleApiKeyContainer.setAttribute("hidden", !0), n)) {
        editorContainer.removeAttribute("hidden"), addButton.removeAttribute("hidden"), deleteButton.removeAttribute("hidden"), messageContainer.setAttribute("hidden", !0);
        let t = n.getAttribute("data-metadata-key");
        setLiItemSelected(n), await saveDataInStorage(RIGHT_ITINERARY, t);
        let o = (await loadDataFromStorage(SAVED_ITINERARY)).find((e) => e.key == t);
        ["username", "password", "googleApiKey", "source", "destination", "train", "mobile", "email"].forEach((t) => {
            var e = document.getElementById(t);
            (e.value = o[t] || ""),
                (e.oninput = function (e) {
                    (o[t] = e.target.value), updateItemTitle(n, o), saveItinerary(o);
                });
        }),
            ["ifConfirm", "autoSearchClick"].forEach((t) => {
                var e = document.getElementById(t),
                    a = "boolean" != typeof o[t] || o[t];
                (o[t] = a) ? e.setAttribute("checked", !0) : e.removeAttribute("checked"),
                    (e.oninput = function (e) {
                        (o[t] = e.target.checked), updateItemTitle(n, o), saveItinerary(o);
                    });
            });
        var e = document.getElementById("date");
        (e.value = (o.date && o.date.split("/").reverse().join("-")) || ""),
            (e.oninput = function (e) {
                (o.date = e.target.value.split("-").reverse().join("/")), updateItemTitle(n, o), saveItinerary(o);
            }),
            ["quota", "seatType"].forEach((t) => {
                var e = document.getElementById(t);
                (o[t] = o[t] || e.options[0].value),
                    (e.value = o[t]),
                    (e.onchange = function (e) {
                        (o[t] = e.target.value), saveItinerary(o);
                    });
            }),
            (passengerContainer.innerHTML = ""),
            o.passengers.forEach((a, n) => {
                let i = createPassengerTemplate(n);
                ["name", "age", "country"].forEach((t) => {
                    var e = jQuery(i).find(`#${t}-` + n)[0];
                    (e.value = a[t] || ""),
                        (e.oninput = function (e) {
                            (a[t] = e.target.value), saveItinerary(o);
                        });
                }),
                    ["preference", "gender", "foodChoice"].forEach((t) => {
                        var e = jQuery(i).find(`#${t}-` + n)[0];
                        (a[t] = a[t] || e.options[0].value),
                            (e.value = a[t]),
                            (e.onchange = function (e) {
                                (a[t] = e.target.value), saveItinerary(o);
                            });
                    }),
                    jQuery(i)
                        .find("#deleteButton-" + n)[0]
                        .addEventListener("click", async function (e) {
                            o.passengers.splice(n, 1);
                            var t = passengerContainer.children;
                            for (let e = 0; e < t.length; e++) t[e] === i && t[e].remove();
                            saveItinerary(o);
                        }),
                    passengerContainer.appendChild(i);
            });
        let a = ["paymentMode", "paymentType", "paymentGateway"];
        var e = document.getElementById(a[0]),
            e =
                ((e.onchange = function (e) {
                    (o.paymentMode = e.target.value), d("paymentMode", "paymentType"), r("paymentType", o), d("paymentType", "paymentGateway"), r("paymentGateway", o), saveItinerary(o);
                }),
                (o[a[0]] = o[a[0]] || e.options[0].value),
                (e.value = o[a[0]]),
                d(a[0], a[1]),
                document.getElementById(a[1])),
            i =
                ((e.onchange = function (e) {
                    (o.paymentType = e.target.value), d("paymentType", "paymentGateway"), r("paymentGateway", o), saveItinerary(o);
                }),
                Array.from(e.options).filter((e) => !e.hasAttribute("hidden"))),
            i = i.find((e) => e.value === o[a[1]]) || i[0],
            e = ((e.value = i.value), d(a[1], a[2]), document.getElementById(a[2])),
            i =
                ((e.onchange = function (e) {
                    (o.paymentGateway = e.target.value), saveItinerary(o);
                }),
                Array.from(e.options).filter((e) => !e.hasAttribute("hidden"))),
            i = i.find((e) => e.value === o[a[2]]) || i[0];
        function r(e, t) {
            var a = document.getElementById(e);
            Array.from(a.options)[a.selectedIndex].hasAttribute("hidden") && (a.value = Array.from(a.options).filter((e) => !e.hasAttribute("hidden"))[0].value), (t[e] = a.value);
        }
        function d(e, a) {
            if (a && e) {
                (e = document.getElementById(e)), (a = document.getElementById(a));
                if (a && e) {
                    let t = Array.from(e.options)[e.selectedIndex].getAttribute("data-option");
                    Array.from(a.options).forEach((e) => {
                        e.getAttribute("data-parent-option") === t ? e.hasAttribute("hidden") && e.removeAttribute("hidden") : e.setAttribute("hidden", !0);
                    });
                }
            }
        }
        (e.value = i.value), saveItinerary(o);
    } else editorContainer.setAttribute("hidden", !0), deleteButton.setAttribute("hidden", !0), messageContainer.removeAttribute("hidden"), addButton.setAttribute("hidden", !0);
}
createKeyDocButton.addEventListener("click", async function () {
    window.open("https://ai.google.dev/gemini-api/docs/api-key", "_blank").focus();
}),
    openInTabButton.addEventListener("click", async function () {
        window.open(document.URL, "_blank"), window.open("", "_self").close();
    }),
    deleteButton.addEventListener("click", async function () {
        let t = await loadDataFromStorage(RIGHT_ITINERARY);
        var e = await loadDataFromStorage(SAVED_ITINERARY),
            a = e.find((e) => e.key == t),
            n =
                (await saveDataInStorage(
                    SAVED_ITINERARY,
                    e.filter((e) => e.key != t)
                ),
                itineraryContainer.children);
        for (let e = 0; e < n.length; e++) n[e].getAttribute("data-metadata-key") === t && n[e].remove();
        a.active && (await saveDataInStorage(ACTIVE_SELECTION_KEY, {})), await saveDataInStorage(RIGHT_ITINERARY, ""), updateRightSection(itineraryContainer.children[0]);
    }),
    addPassengerButton.addEventListener("click", async function () {
        try {
            let t = await loadDataFromStorage(RIGHT_ITINERARY);
            var e = (await loadDataFromStorage(SAVED_ITINERARY)).find((e) => e.key === t);
            e.passengers.push({ name: "", age: "", gender: "", preference: "", country: "" }), await saveItinerary(e), updateRightSection(itineraryToItem(t));
        } catch (e) {
            console.error(e);
        }
    }),
    addButton.addEventListener("click", addItinerary),
    addItineraryCenter.addEventListener("click", addItinerary);
let counter = 0;
async function getISTTime() {
    let t;
    try {
        if (0 != counter) throw {};
        var e = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
        if (!e.ok) throw {};
        var a = (await e.json()).datetime;
        t = new Date(a);
    } catch (e) {
        t = new Date();
    }
    var n;
    60 <= ++counter && (counter = 0), t && ((e = String(t.getHours()).padStart(2, "0")), (a = String(t.getMinutes()).padStart(2, "0")), (n = String(t.getSeconds()).padStart(2, "0")), (timeUI.textContent = e + `:${a}:${n} IST`));
}
async function main() {
    var e = await renderItineraries(!0),
        t = await loadDataFromStorage(RIGHT_ITINERARY);
    updateRightSection((t && itineraryToItem(t)) || (e && itineraryToItem(e.key))), initilizeTooltip(), setInterval(getISTTime, 1e3);
}
main();
