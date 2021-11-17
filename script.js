const root_url = "http://localhost:3000/";
let countries = [{"name":"Bangladesh","alpha2":"BD"},{"name":"Cameroon","alpha2":"CM"},{"name":"Congo (Democratic Republic of the)","alpha2":"CD"},{"name":"Côte d'Ivoire","alpha2":"CI"},{"name":"Ethiopia","alpha2":"ET"},{"name":"Gabon","alpha2":"GA"},{"name":"Ghana","alpha2":"GH"},{"name":"India","alpha2":"IN"},{"name":"Kenya","alpha2":"KE"},{"name":"Mozambique","alpha2":"MZ"},{"name":"Nigeria","alpha2":"NG"},{"name":"Pakistan","alpha2":"PK"},{"name":"South Africa","alpha2":"ZA"},{"name":"Tanzania, United Republic of","alpha2":"TZ"},{"name":"Uganda","alpha2":"UG"},{"name":"Zambia","alpha2":"ZM"},{"name":"Zimbabwe","alpha2":"ZW"}], 
	country = null, channels = [];

function load(url, callback, errorCallback) { $.ajax({type: "GET", url: url, success: callback, errorCallback }); }

function loadCountries() {
	load(root_url + "api/countries?channels=true", onLoadCountries, countriesError); 
}

function loadChannels() { 
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("country")) {
		country = countries.find(c => { return c.alpha2.toUpperCase() === urlParams.get("country").toUpperCase(); });
	}

	var url = root_url + "api/channels?bookmarked=true&order_key=name";
	if (country) {
		$("#selected-country-dropdown").text(getCountryFlag(country) + " " + country.name.toUpperCase());
		url += "&country=" + country.alpha2;
	}
	load(url, onLoadChannels, channelsError); 
}

function fillInDropdowns() { 
	countries.forEach(country => addCountry(country));
}

function addCountry(country) {
	var link = document.createElement("a");
	link.className = "dropdown-item " + country.alpha2;
	link.href = "ussd-codes.html?country=" + country.alpha2;
	link.innerHTML = getCountryFlag(country) + " " + country.name;
	var li = document.createElement("li");
	li.append(link);
	$("#dropdown-country-list").append(li.cloneNode(true));
	$("#header-dropdown-country-list").append(li);
}

function fillInList() { 
	$("#channels-loading").hide();
	channels.forEach(channel => addChannel(channel));
}

function addChannel(channel) {
	var link = document.createElement("a");
	link.href = "tel:" + channel.root_code.replace("#", "%23");
	link.innerHTML = channel.root_code;
	var li = document.createElement("li");
	li.append(link, getChannelName(channel));
	$("#channel-list").append(li);
}


function getChannelName(channel) {
	var name = " " + channel.name;
	return country == null ? name + " " + channel.country_alpha2.toUpperCase() : name;
}

function getCountryFlag(country) {
	const codePoints = country.alpha2.toUpperCase()
	    .split('')
	    .map(char =>  127397 + char.charCodeAt());
	return String.fromCodePoint(...codePoints);
}

function onLoadCountries(result) {
	countries = result.map(function(d) { return d; });
	loadChannels();
	fillInDropdowns();
}

function onLoadChannels(result) {
	channels = result.data.map(function(d) { return d.attributes; });
	fillInList();
}

function countriesError() {
	$("#dropdown-country-label").text("Network error, please reload.");
}

function channelsError() {
	$("#channels-loading").text("Network error, please reload.")
}

onLoadCountries(countries);