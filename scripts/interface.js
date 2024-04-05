class Profile {
    static activeIndex = 0;
    static list = [];

    static get ActiveElement() {
        return this.list[this.activeIndex];
    }

    static set ActiveElement(profile) {
        this.list[this.activeIndex] = profile;
    }

    static get TabList() {
        var tabList = [];
        for (const currentProfile of this.list)
            tabList.push(currentProfile.Tab);

        return tabList;
    }

    static get Count() {
        return this.list.length;
    }

    get Index() {
        return Profile.list.indexOf(this);  
    }

    get Tab() {
        return tabContainer.children[Profile.list.indexOf(this)];
    }

    constructor(name) {
        this.name = name;
    }
    
    rollHistory = [];

    backstory = "";
    class = "";
    classLevel = 1;
    background = "";
    playerName = "";
    race = "";
    alignment = "";
    xp = 0;
}

const hoverableElements = document.querySelectorAll('input, button, .clickable, .tab, label');
let hoverVolume = 0.01;
let clickVolume = 0.07;
let interact = false;

for (const element of hoverableElements) {
    element.addEventListener("mouseover", function () {
        if (!interact) return;
        const hoverSFX = new Audio('audio/sfx/Click.wav');
        hoverSFX.volume = hoverVolume;
        hoverSFX.play();
    });
    element.addEventListener("mousedown", function () {
        interact = true;
        const clickSFX = new Audio('audio/sfx/Click.wav');
        clickSFX.volume = clickVolume;
        clickSFX.play();
    });
}


function NotImplemented() {
    ShowPopUp('Not Implemented', 'This feature is still work in progress. Try messing around with something else', 'Close', 'Okay');
}

var tabContainer = document.querySelector('.tabs');
var tabCounter = document.querySelector('.tabCounter');
var tabUI = tabContainer.firstElementChild.outerHTML;
var tabRenamer = document.querySelector('.characterName');
var sheetRenamer = document.querySelector('.sheetName');

Profile.list.push(new Profile("Dungeon Master"));

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "T" || event.shiftKey && event.key === "t")) {
        NewTab();
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "W" || event.shiftKey && event.key === "w")) {
        RequestDeleteTab(Profile.ActiveElement.Tab);
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") Escape();
});

function Escape() {
    HidePopUp();
    CloseSettings();
    CloseSheet();
}


let loader = document.querySelector('.loader');
let loaderMask = document.querySelector('.loaderMask');
window.addEventListener("load", function () {/*
    setTimeout(function () {
        loaderMask.style.height = '100vh';
    }, 2000);
    setTimeout(function () {
        loader.style.opacity = '0';
        loader.style.zIndex = '-6';
    }, 3000);*/
    SelectActiveTab();
    DisableChildren(settingsMenu);
    DisableChildren(sheetMenu);
});

function NewTab() {
    if (Profile.list.length >= 99) return;

    Profile.list.push(new Profile("New Character (" + Profile.Count + ")"));
    tabContainer.innerHTML += tabUI;

    UpdateSheets();
    SelectActiveTab();

    Profile.TabList[(Profile.Count - 1)].firstElementChild.focus();
    SelectTab(Profile.TabList[Profile.Count - 1])
}

let backstoryField = document.getElementById("backstoryField");
let classLevelField = document.getElementById("levelField");
let playerNameField = document.getElementById("playerNameField");
let backgroundField = document.getElementById("backgroundField");
let xpField = document.getElementById("xpField");
function UpdateSheets() {
    for (const tab of Profile.TabList) {
        const index = Profile.TabList.indexOf(tab);
        tab.firstElementChild.value = Profile.list[index].name;
    }

    tabRenamer.value = Profile.ActiveElement.name;
    sheetRenamer.value = Profile.ActiveElement.name;

    backstoryField.value = Profile.ActiveElement.backstory;
    classLevelField.value = Profile.ActiveElement.classLevel;
    playerNameField.value = Profile.ActiveElement.playerName;
    backgroundField.value = Profile.ActiveElement.background;
    xpField.value = Profile.ActiveElement.xp;
}

function SelectActiveTab() {
    if (Profile.activeIndex >= Profile.Count)
        Profile.activeIndex = Profile.Count - 1;
    if (Profile.activeIndex < 0)
        Profile.activeIndex = 0;

    UpdateSheets();

    Profile.list.forEach(profile => {
        profile.Tab.classList.remove('active');
    });
    Profile.ActiveElement.Tab.classList.add('active');

    tabCounter.innerHTML = Profile.Count;
}

function SelectTab(tab) {
    Profile.activeIndex = Profile.TabList.indexOf(tab);
    UpdateHistory();
    SelectActiveTab();
}

function RequestUploadActiveProfile() {
    ShowPopUp('Overwrite Character?', 'This will permanently replace "' + Profile.ActiveElement.name + '"! Make sure to backup to JSON first', 'Cancel', 'Overwrite');
    popUpPositive.onclick = function () {
        UploadActiveProfile();
    };
}

// not working (only works with 3 or 4 tabs)
function MiddleClickDeleteTab(event, tab) {
    if (event.button === 1) {
        RequestDeleteTab(tab)
    }
}

function RequestDeleteTab(tab) {
    if (Profile.list.length == 1) return;

    var profile = Profile.list[Profile.TabList.indexOf(tab)];
    ShowPopUp('Delete Character?', 'This will permanently delete "' + profile.name + '"! Make sure to backup to JSON first', 'Cancel', 'Delete');
    popUpPositive.onclick = function () {
        DeleteTab(profile);
    };
}

function DeleteTab(profile) {
    index = Profile.list.indexOf(profile);

    if (index < Profile.activeIndex)
        Profile.activeIndex--;

    Profile.list[index].Tab.remove();
    Profile.list.splice(index, 1);

    SelectActiveTab();
    HidePopUp();
    return;
}

function DownloadActiveProfile() {
    Download(Profile.ActiveElement.name + " Profile Backup (" + new Date().getTime() + ")",
        JSON.stringify(Profile.ActiveElement));
}

function Download(fileName, content) {
    var anchor = document.createElement('a');
    anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    anchor.setAttribute('download', fileName + '.json');
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

var uploader;
var file;
var content;
function UploadActiveProfile() {
    uploader = document.createElement('input');
    uploader.setAttribute('type', 'file');
    uploader.setAttribute('accept', '.json');
    uploader.style.display = 'none';

    document.body.append(uploader);
    uploader.addEventListener('change', HandleUpload);
    uploader.click();

    HidePopUp();
}

function HandleUpload(event) {
    const selectedFiles = event.target.files;

    if (selectedFiles.length > 0) file = selectedFiles[0];

    document.body.removeChild(uploader);

    var reader = new FileReader();

    reader.onload = function () {
        try {
            parseResult = JSON.parse(reader.result);
            Profile.ActiveElement.name = parseResult.name;
            Profile.ActiveElement.rollHistory = parseResult.rollHistory;
            Profile.ActiveElement.backstory = parseResult.backstory;
            Profile.ActiveElement.class = parseResult.class;
            Profile.ActiveElement.classLevel = parseResult.classLevel;
            Profile.ActiveElement.background = parseResult.background;
            Profile.ActiveElement.playerName = parseResult.playerName;
            Profile.ActiveElement.race = parseResult.race;
            Profile.ActiveElement.alignment = parseResult.alignment;
            Profile.ActiveElement.xp = parseResult.xp;
            UpdateHistory();
        } catch {
            ShowPopUp('Upload Error', 'The file you uploaded was either not a compatible JSON file or was corrupted', 'Close', 'Okay');
        }

        UpdateSheets();
    };

    if (file != null) reader.readAsText(file);
}

var popUpContainer = document.querySelector('.popUpContainer');
var popUpElement = document.querySelector('.popUp');
var popUpTitle = document.querySelector('.popUpTitle');
var popUpContent = document.querySelector('.popUpContent');
var popUpPositive = document.querySelector('.popUpButtonTrue');
var popUpNegative = document.querySelector('.popUpButtonFalse');

let popVolume = 0.2;
function ShowPopUp(title, content, negative, positive) {
    const popSFX = new Audio('audio/sfx/Pop.wav');
    popSFX.volume = popVolume;
    popSFX.play();

    DisableChildren(main);
    EnableChildren(popUpContainer);
    popUpPositive.focus();

    popUpContainer.style.opacity = '1';
    popUpContainer.style.zIndex = '5';
    popUpElement.style.transform = 'scale(1)';

    popUpTitle.innerHTML = title;
    popUpContent.innerHTML = content;

    popUpNegative.innerHTML = negative;
    popUpPositive.innerHTML = positive;
}

function HidePopUp() {
    popUpContainer.style.opacity = '0';
    popUpContainer.style.zIndex = '-5';
    popUpElement.style.transform = 'scale(0.5)';

    popUpPositive.setAttribute('onclick', 'HidePopUp()');
    popUpNegative.setAttribute('onclick', 'HidePopUp()');

    EnableChildren(main);
    DisableChildren(popUpContainer);
}

var settingsMenu = document.querySelector('.settingsPanel');
function OpenSettings() {
    settingsMenu.style.transform = 'translateX(0%)';

    DisableChildren(main);
    EnableChildren(settingsMenu);
}

function CloseSettings() {
    settingsMenu.style.transform = 'translateX(-110%)';

    EnableChildren(main);
    DisableChildren(settingsMenu);
}

var sheetMenu = document.querySelector('.sheetPanel');
function OpenSheet() {
    sheetMenu.style.transform = 'translateX(calc(100vw - 100% - 1em))';

    DisableChildren(main);
    EnableChildren(sheetMenu);
}

function CloseSheet() {
    sheetMenu.style.transform = 'translateX(100vw)';

    EnableChildren(main);
    DisableChildren(sheetMenu);
}

function ToggleSettingGroup(group, arrow) {
    if (group.classList.contains('active')) {
        DisableChildren(group);
        group.classList.remove('active');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        EnableChildren(group);
        group.classList.add('active');
        arrow.style.transform = 'rotate(90deg)';
    }
}

var main = document.querySelector('main');
var disablePage = document.querySelector('.disablePage');
function DisableChildren(element) {
    if (element == document.querySelector('main')) {
        disablePage.style.zIndex = '3';
        disablePage.style.opacity = '1';
    }

    element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(item => {
        item.disabled = true;
    });
}
function EnableChildren(element) {
    if (element == document.querySelector('main')) {
        disablePage.style.zIndex = '-3';
        disablePage.style.opacity = '0';
    }

    element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(item => {
        item.disabled = false;
    });
}

var historyList = document.querySelector('.historyList');
var historyListItem = historyList.firstElementChild;
historyList.innerHTML = "";

function Roll(max, formula) {
    var roll = Math.ceil((1 - Math.random()) * max) + 1;
    Profile.ActiveElement.rollHistory.unshift({"roll": roll, "max": max, "formula": formula});
    if (Profile.ActiveElement.rollHistory.length > 50) Profile.ActiveElement.rollHistory.pop();
    UpdateHistory();
    
    return roll;
}

function UpdateHistory() {
    historyList.innerHTML = "";
    for (const entry of Profile.ActiveElement.rollHistory) {
        historyList.innerHTML = historyList.innerHTML + historyListItem.outerHTML;
        historyList.lastElementChild.children[1].children[0].innerHTML = entry.roll + " of " + entry.max;
        historyList.lastElementChild.children[1].children[1].innerHTML = entry.formula;
    }
}

function DeleteHistoryAt(element) {
    ShowPopUp("Delete Roll?", "This will permanently delete this roll from this character! Are you sure?", "Cancel", "Delete");
    popUpPositive.onclick = function () {
        var index = Array.from(historyList.children).indexOf(element);
        Profile.ActiveElement.rollHistory.splice(index, 1);
        UpdateHistory();
        HidePopUp();
    };
}

function DeleteHistory() {
    if (Profile.ActiveElement.rollHistory.length <= 0) return;
    ShowPopUp("Delete History?", "This will permanently delete all rolls for this character, and cannot be undone! Are you sure?", "Cancel", "Delete All");
    popUpPositive.onclick = function () {
        Profile.ActiveElement.rollHistory = [];
        UpdateHistory();
        HidePopUp();
    };
}

function DropdownSelect(element) {
    var activeValue = element.parentElement.children[1].querySelector(".dropdownListItemLabelText").innerHTML;

    if (element.name == "class") Profile.ActiveElement.class = activeValue;
    if (element.name == "alignment") Profile.ActiveElement.alignment = activeValue;
    if (element.name == "race") Profile.ActiveElement.race = activeValue;

    if (element.checked) element.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.setAttribute("data-dropdown-content", activeValue)
    else if (document.querySelectorAll("input[name=" + element.name + "]:checked").length > 0) element.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.setAttribute("data-dropdown-content", "None");
}

for (const container of document.querySelectorAll(".dropdownContainer")) {
    container.addEventListener("focusout", () => {
        element = container.querySelector("input[type='radio']")
        if (!document.querySelectorAll("input[name=" + element.name + "]:checked").length > 0) { 
            element.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.setAttribute("data-dropdown-content", "None"); 
        }
    });
}

function SearchDropdown(searchbar) {
    var options = [];
    var optionChildren = searchbar.parentElement.parentElement.children[1].children;
    for (const option of optionChildren) {
        var listLabel = option.children[1];

        var text = listLabel.firstElementChild.innerHTML;
        if (text.toLowerCase().includes(searchbar.value.toLowerCase().toString())) {
            options.push(text);
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    }
}

const numInputs = document.querySelectorAll('input[type=number]')

numInputs.forEach(function(input) {
  input.addEventListener('change', function(e) {
    var min = Number(e.target.min);
    var max = Number(e.target.max);

    if (e.target.value == '') {
        if (e.target.min != '') 
            e.target.value = min;
        else if (e.target.max != '')
            e.target.value = max;
        else
            e.target.value = 0;
    } else if ((e.target.value < min) && (e.target.min != '')) {
        e.target.value = e.target.min;
    } else if ((e.target.value > max) && (e.target.max != '')) {
        e.target.value = e.target.max;
    }
  })
})

function ResetDropdown(element) {
    var listItems = element.parentElement.querySelector('ul').children;

    for (const item of listItems) {
        item.firstElementChild.checked = false;
    }
}

var sheets = Array.from(document.querySelector('.sheetContentArea').children);
function SwitchSheet(indexToSelect) {
    for (const sheet of sheets) {
        var index = sheets.indexOf(sheet);

        if (index == indexToSelect) sheet.classList.add('active');
        else sheet.classList.remove('active');
    }
}