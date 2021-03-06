const root_url = "https://www.usehover.com/";
let countries = [],	country = null, channels = [];

function load(url, callback, errorCallback) { $.ajax({type: "GET", url: url, success: callback, errorCallback }); }

function loadCountries() {
	load(root_url + "api/countries?channels=true", onLoadCountries, countriesError); 
}

function loadChannels() {
	if (window.location.href.includes("ussd-codes")) {
		const urlParams = new URLSearchParams(window.location.search);
		const url = window.location.href.replace(/\/$/, '');
		const lastSeg = url.substring(url.lastIndexOf('/') + 1);
		
		if (urlParams.get("country")) {
			country = countries.find(c => { return c.alpha2.toUpperCase() === urlParams.get("country").toUpperCase(); });
		} else if (lastSeg.length == 2) {
			country = countries.find(c => { return c.alpha2.toUpperCase() === lastSeg.toUpperCase(); });
		}

		var channel_url = root_url + "api/channels?bookmarked=true&order_key=name";
		if (country) {
			setPageCountry(country);
			channel_url += "&country=" + country.alpha2;
		}
		load(channel_url, onLoadChannels, channelsError);
	}
}

function setPageCountry(country) {
	$("#selected-country-dropdown").text(getCountryFlag(country) + " " + country.name.toUpperCase());
	document.title = document.title + ": " + country.name;
	if (descriptions && descriptions[country.alpha2.toUpperCase()]) {
		$("#custom-description").html(descriptions[country.alpha2.toUpperCase()]);
		document.getElementsByTagName('meta')["description"].content = descriptions[country.alpha2.toUpperCase()];
	}
}

function fillInDropdowns() { 
	countries.forEach(country => addCountryToDropdown(country));
}

function addCountryToDropdown(country) {
	var link = document.createElement("a");
	link.className = "dropdown-item " + country.alpha2;
	link.href = "/ussd-codes/" + country.alpha2;
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
	var tr = document.createElement("tr");
	tr.append(getCodeCell(channel), getNameCell(channel));
	$("#channel-list").append(tr);
}

function getCodeCell(channel) {
	var cell = document.createElement("td");
	var link = document.createElement("a");
	link.href = "tel:" + channel.root_code.replace("#", "%23");
	link.innerHTML = channel.root_code;
	cell.append(link);
	return cell;
}

function getNameCell(channel) {
	var cell = document.createElement("td");
	var name = channel.name;
	cell.append(country == null ? name + " " + channel.country_alpha2.toUpperCase() : name);
	return cell;
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

loadCountries();