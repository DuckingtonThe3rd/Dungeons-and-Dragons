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

Profile.list.push(new Profile("Dungeon Master"));

SelectActiveTab();

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
    if (event.key === "Escape")
        HidePopUp();
});


let loader = document.querySelector('.loader');
let loaderMask = document.querySelector('.loaderMask');
window.addEventListener("load", function () {
    setTimeout(function () {
        loaderMask.style.height = '100vh';
    }, 2000);
    setTimeout(function () {
        loader.style.opacity = '0';
        loader.style.zIndex = '-6';
    }, 3000);
    DisableChildren(settingsMenu);
});

function NewTab() {
    if (Profile.list.length >= 99) return;

    Profile.list.push(new Profile("New Character (" + Profile.Count + ")"));
    tabContainer.innerHTML += tabUI;

    UpdateFromData();
    SelectActiveTab();

    Profile.TabList[(Profile.Count - 1)].firstElementChild.focus();
    SelectTab(Profile.TabList[Profile.Count - 1])
}

function UpdateLocal(field) {
    var profile = Profile.list[Profile.TabList.indexOf(field.parentElement)];

    if (field.value.replace(" ", "") == '')
        field.value = '';

    profile.name = field.value;

    UpdateFromData();
}

function UpdateGlobal() {
    if (tabRenamer.value.replace(" ", "") == '')
        tabRenamer.value = '';

    Profile.ActiveElement.name = tabRenamer.value;

    UpdateFromData();
}

function UpdateFromData() {
    for (const tab of Profile.TabList) {
        const index = Profile.TabList.indexOf(tab);
        tab.firstElementChild.value = Profile.list[index].name;
    }

    tabRenamer.value = Profile.ActiveElement.name;
}

function SelectActiveTab() {
    if (Profile.activeIndex >= Profile.Count)
        Profile.activeIndex = Profile.Count - 1;
    if (Profile.activeIndex < 0)
        Profile.activeIndex = 0;

    UpdateFromData();

    Profile.list.forEach(profile => {
        profile.Tab.classList.remove('active');
    });
    Profile.ActiveElement.Tab.classList.add('active');

    tabCounter.innerHTML = Profile.Count;
}

function SelectTab(tab) {
    Profile.activeIndex = Profile.TabList.indexOf(tab);
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

    Profile.list.splice(index, 1);
    Profile.list[index].Tab.remove();

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

// JSON parsing not working
function HandleUpload(event) {
    const selectedFiles = event.target.files;

    if (selectedFiles.length > 0) file = selectedFiles[0];

    document.body.removeChild(uploader);

    var reader = new FileReader();

    reader.onload = function () {
        try {
            Profile.ActiveElement = JSON.parse(reader.result);
        } catch {
            ShowPopUp('Upload Error', 'The file you uploaded was either not a compatible JSON file or was corrupted', 'Close', 'Okay');
        }

        UpdateFromData();
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