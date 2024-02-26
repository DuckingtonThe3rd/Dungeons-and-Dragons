class Profile {
    static activeIndex = 0;
    static list = [];

    static get activeElement() {
        return this.list[this.activeIndex];
    }

    constructor(index, name, tab) {
        this.index = index;
        this.name = name;
        this.tab = tab;
    }
}

function NotImplemented() {
    ShowPopUp('Not Implemented', 'This feature is still work in progress. Try messing around with something else', 'Close', 'Okay');
}

let tabContainer = document.querySelector('.tabs');
let tabCounter = document.querySelector('.tabCounter');
let tabUI = tabContainer.firstElementChild.outerHTML;
let tabRenamer = document.querySelector('.characterName');

Profile.list.push(new Profile(0, "Dungeon Master", tabUI));

SelectActiveTab();

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "T" || event.shiftKey && event.key === "t")) {
        NewTab();
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && (event.key === "W" || event.shiftKey && event.key === "w")) {
        RequestDeleteTab(Profile.activeElement.tab);
        event.preventDefault();
    }
});

function NewTab() {
    if (Profile.list.length >= 99) return;

    tabContainer.innerHTML += tabUI;
    Profile.list.push(new Profile(Profile.list.length, "New Character (" + Profile.list.length + ")"));

    SelectActiveTab();
    var newTab = Profile.list[Profile.list.length - 1];
    newTab.tab.firstElementChild.focus();
}

function UpdateLocal() {
    for (let index = 0; index < Profile.list.length; index++) {
        const profile = Profile.list[index];

        if (profile.tab.firstElementChild.value.replace(" ", "") == '')
            profile.tab.firstElementChild.value = 'Unnamed';

        profile.name = profile.tab.firstElementChild.value;
        if (index == Profile.activeIndex)
            tabRenamer.value = profile.name;
    }
}

function UpdateGlobal() {
    for (let index = 0; index < Profile.list.length; index++) {
        const profile = Profile.list[index];

        if (profile.tab.firstElementChild.value.replace(" ", "") == '')
            tabRenamer.value = 'Unnamed';

        if (index == Profile.activeIndex) {
            profile.name = tabRenamer.value;
            profile.tab.firstElementChild.value = profile.name;
        }
    }
}

function SelectActiveTab() {
    if (Profile.activeIndex < 0) Profile.activeIndex = 0;
    if (Profile.activeIndex >= Profile.list.length) Profile.activeIndex = Profile.list.length - 1;

    for (let index = 0; index < Profile.list.length; index++) {
        const profile = Profile.list[index];

        var children = tabContainer.children;
        profile.tab = children[index];
        profile.tab.firstElementChild.value = profile.name;
        if (index == Profile.activeIndex)
            tabRenamer.value = profile.name;

        if (index != Profile.activeIndex)
            profile.tab.classList.remove('active');
        else
            profile.tab.classList.add('active');
    }

    tabCounter.innerHTML = Profile.list.length;
}

function SelectTab(tab) {
    for (let index = 0; index < Profile.list.length; index++) {
        const profile = Profile.list[index];

        if (profile.tab == tab) {
            Profile.activeIndex = index;
            tabRenamer.value = profile.name;
            SelectActiveTab();
        }
    }
}

function RequestUploadActiveProfile() {
    ShowPopUp('Overwrite Character?', 'This will permanently replace "' + Profile.activeElement.name + '"! Make sure to backup to JSON first', 'Cancel', 'Overwrite');
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

    for (let index = 0; index < Profile.list.length; index++) {
        const profile = Profile.list[index];

        if (profile.tab == tab) {
            ShowPopUp('Delete Character?', 'This will permanently delete "' + profile.name + '"! Make sure to backup to JSON first', 'Cancel', 'Delete');
            popUpPositive.onclick = function () {
                DeleteTab(profile);
            };
        }
    }
}

function DeleteTab(profile) {
    Profile.list.splice(Profile.list.indexOf(profile), 1);

    if (Profile.list[profile] < Profile.activeIndex) 
        Profile.activeIndex--;

    profile.tab.style.transform = 'scale(0.25)';
    profile.tab.style.width = '0px';
    profile.tab.style.padding = '0px';
    profile.tab.style.margin = '0px';
    profile.tab.style.opacity = '0';

    profile.tab.remove();

    SelectActiveTab();
    HidePopUp();
    return;
}

function DownloadActiveProfile() {
    Download(Profile.activeElement.name + " Profile Backup (" + new Date().getTime() + ")",
        JSON.stringify(Profile.activeElement));
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
        var oldIndex = Profile.activeElement.index;
        try {
            Profile.activeElement = JSON.parse(reader.result);
        } catch {
            ShowPopUp('Upload Error', 'The file you uploaded was either not a compatible JSON file or was corrupted', 'Close', 'Okay');
        }
        Profile.activeElement.index = oldIndex;

        SelectActiveTab();
    };

    if (file != null) reader.readAsText(file);
}

let popUpContainer = document.querySelector('.popUpContainer');
let popUpElement = document.querySelector('.popUp');
let popUpTitle = document.querySelector('.popUpTitle');
let popUpContent = document.querySelector('.popUpContent');
let popUpPositive = document.querySelector('.popUpButtonTrue');
let popUpNegative = document.querySelector('.popUpButtonFalse');

function ShowPopUp(title, content, negative, positive) {

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

let settingsMenu = document.querySelector('.settingsPanel');
function OpenSettings() {
    settingsMenu.style.transform = 'translateX(0%)';

    DisableChildren(main);
    EnableChildren(settingsMenu);
    // allButtons[1].focus();
}

function CloseSettings() {
    settingsMenu.style.transform = 'translateX(-110%)';

    EnableChildren(main);
    DisableChildren(settingsMenu);
}

function ToggleSettingGroup(group, arrow) {
    if (group.classList.contains('active')) {
        group.classList.remove('active');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        group.classList.add('active');
        arrow.style.transform = 'rotate(90deg)';
    }
}

let main = document.querySelector('main');
let disablePage = document.querySelector('.disablePage');
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