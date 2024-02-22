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
        DeleteTab(tabElements[activeElement].element);
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

        if (tabData.element.firstElementChild.value == '')
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

function DeleteTab(tab) {
    if (tabElements.length == 1) return;

    for (let index = 0; index < tabElements.length; index++) {
        const tabData = tabElements[index];

        if (tabData.element == tab) {
            tabElements.splice(index, 1);
            if (index < activeElement) activeElement--;
            SelectActiveTab();

            tabData.element.style.transform = 'scale(0.25)';
            tabData.element.style.width = '0px';
            tabData.element.style.padding = '0px';
            tabData.element.style.margin = '0px';
            tabData.element.style.opacity = '0';

            var destroyTab = setInterval(() => {
                if (tabData.element.style.transform == 'scale(0.25)') {
                    clearInterval (destroyTab);
                    tabData.element.remove();
                    SelectActiveTab();
                }
            }, 50);

            SelectActiveTab();
            return;
        }
    }
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

    reader.onload = function() {
        var oldIndex = tabElements[activeElement].profile.index;
        tabElements[activeElement].profile = JSON.parse(reader.result);
        tabElements[activeElement].index = oldIndex;

        SelectActiveTab();
    };
    
    if (file != null) reader.readAsText(file);
}