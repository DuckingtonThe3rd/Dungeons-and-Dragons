class Profile {
    constructor(index, name) {
        this.index = index;
        this.name = name;
    }
}

let tabContainer = document.querySelector('.tabs');
let tabCounter = document.querySelector('.tabCounter');
let tabUI = tabContainer.firstElementChild.outerHTML;
let tabRenamer = document.querySelector('.characterName');

var activeElement = 0;
var tabElements = [{
    element: tabContainer.firstElementChild,
    profile: new Profile(0, "Dungeon Master")
}];

SelectActiveTab();

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key === "T") {
        NewTab();
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key === "W") {
        RequestDeleteTab(tabElements[activeElement].element);
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key === "t") {
        NewTab();
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key === "w") {
        RequestDeleteTab(tabElements[activeElement].element);
        event.preventDefault();
    }
});

function NewTab() {
    if (tabElements.length >= 99) return;

    tabContainer.innerHTML += tabUI;
    tabElements.push({
        element: tabContainer.lastElementChild,
        profile: new Profile(tabElements.length, "New Character (" + tabElements.length + ")")
    });

    SelectActiveTab();
    tabElements[tabElements.length - 1].element.firstElementChild.focus();
}

function UpdateLocal() {
    for (let index = 0; index < tabElements.length; index++) {
        const tabData = tabElements[index];

        if (tabData.element.firstElementChild.value.replace(" ", "") == '')
            tabData.element.firstElementChild.value = 'Unnamed';
        if (tabData.profile.name != tabData.element.firstElementChild.value) {
            tabData.profile.name = tabData.element.firstElementChild.value;
            if (index == activeElement) tabRenamer.value = tabData.profile.name;
        }
    }
}

function UpdateGlobal() {
    for (let index = 0; index < tabElements.length; index++) {
        const tabData = tabElements[index];

        if (tabRenamer.value == '') tabRenamer.value = 'Unnamed';
        if (index == activeElement) {
            tabData.profile.name = tabRenamer.value;
            tabData.element.firstElementChild.value = tabData.profile.name;
        }
    }
}

function SelectActiveTab() {
    if (activeElement < 0) activeElement = 0;
    if (activeElement >= tabElements.length) activeElement = tabElements.length - 1;

    for (let index = 0; index < tabElements.length; index++) {
        const tabData = tabElements[index];

        var children = tabContainer.children;
        tabData.element = children[index];
        tabData.element.firstElementChild.value = tabData.profile.name;
        if (index == activeElement)
            tabRenamer.value = tabData.profile.name;

        if (index != activeElement) tabData.element.classList.remove('active');
        else tabData.element.classList.add('active');
    }

    tabCounter.innerHTML = tabElements.length;
}

function SelectTab(tab) {
    for (let index = 0; index < tabElements.length; index++) {
        const tabData = tabElements[index];

        if (tabData.element == tab) {
            activeElement = index;
            tabRenamer.value = tabData.profile.name;
            SelectActiveTab();
        }
    }
}


function RequestDeleteTab(tab) {
    if (tabElements.length == 1) return;

    for (let index = 0; index < tabElements.length; index++) {
        const tabData = tabElements[index];

        if (tabData.element == tab) {
            ShowPopUp('Delete Character?', 'This will permanently delete "' + tabData.profile.name + '"! Make sure to backup to JSON first', 'Cancel', 'Delete');
            popUpPositive.onclick = function () {
                DeleteTab(tabData);
            };
        }
    }
}

function DeleteTab(tabData) {
    tabElements.splice(tabElements.indexOf(tabData), 1);
    if (tabElements[tabData] < activeElement) activeElement--;
    SelectActiveTab();

    tabData.element.style.transform = 'scale(0.25)';
    tabData.element.style.width = '0px';
    tabData.element.style.padding = '0px';
    tabData.element.style.margin = '0px';
    tabData.element.style.opacity = '0';

    var destroyTab = setInterval(() => {
        if (tabData.element.style.transform == 'scale(0.25)') {
            clearInterval(destroyTab);
            tabData.element.remove();
            SelectActiveTab();
        }
    }, 350);

    SelectActiveTab();
    HidePopUp();
    return;
}

function DownloadActiveProfile() {
    Download(tabElements[activeElement].profile.name + " Profile Backup (" + new Date().getTime() + ")",
        JSON.stringify(tabElements[activeElement].profile));
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
}

function HandleUpload(event) {
    const selectedFiles = event.target.files;

    if (selectedFiles.length > 0) file = selectedFiles[0];

    document.body.removeChild(uploader);

    var reader = new FileReader();

    reader.onload = function () {
        var oldIndex = tabElements[activeElement].profile.index;
        tabElements[activeElement].profile = JSON.parse(reader.result);
        tabElements[activeElement].index = oldIndex;

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
    if (!title || !content || !negative || !positive)
        console.error("PopUp: Missing arguments");

    popUpPositive.disabled = false;
    popUpNegative.disabled = false;

    popUpContainer.style.display = 'flex';
    popUpPositive.focus();

    var createPopUp = setInterval(() => {
        if (popUpContainer.style.display == 'flex') {
            clearInterval(createPopUp);

            popUpContainer.style.opacity = '1';
            popUpContainer.style.zIndex = '5';
            popUpElement.style.transform = 'scale(1)';

            popUpTitle.innerHTML = title;
            popUpContent.innerHTML = content;

            popUpNegative.innerHTML = negative;
            popUpPositive.innerHTML = positive;
        }
    }, 50);
}

function HidePopUp() {
    popUpContainer.style.opacity = '0';
    popUpContainer.style.zIndex = '-5';
    popUpElement.style.transform = 'scale(0.5)';

    var destroyPopUp = setInterval(() => {
        if (popUpContainer.style.opacity == '0') {
            clearInterval(destroyPopUp);
            popUpContainer.style.display = 'none';
        }
    }, 50);

    popUpPositive.setAttribute('onclick', 'HidePopUp()');
    popUpNegative.setAttribute('onclick', 'HidePopUp()');

    popUpPositive.disabled = true;
    popUpNegative.disabled = true;
}

let settingsMenu = document.querySelector('.settingsPanel');
function OpenSettings() {
    settingsMenu.style.transform = 'translateX(0%)';
}

function CloseSettings() {
    settingsMenu.style.transform = 'translateX(-100%)';
}