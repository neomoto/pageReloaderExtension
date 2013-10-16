var menuVariants = [30, 60, 120, 360, "custom", 0],
    tabIds = [],
    currentTabId,
    timer,
    menuItems = [];

chrome.tabs.onActivated.addListener(function(changeInfo) {
    currentTabId = changeInfo.tabId;
    chrome.tabs.get(currentTabId, function(tab){
        if (tab.url.indexOf("opera://") == -1){
            chrome.contextMenus.update('rootReloadMenuItem', {enabled: true});
            if(!tabIds[currentTabId] || (tabIds[currentTabId] && !tabIds[currentTabId].timer)){
                recreateMenu('reload_0');
            }
            else if(tabIds[currentTabId].timer) {
                recreateMenu(tabIds[currentTabId].menuItemId);
            }
        }
        else {
            chrome.contextMenus.update('rootReloadMenuItem', {enabled: false});
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "resetMenu") {
        recreateMenu('reload_0');
    }
    if (request.action == "startReload") {
        if(request.value > 0){
            startReloadPage(request.value, currentTabId, 'reload_custom');
        }
    }
});

function createMenu(activeMenuId){
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage("rootMenuItem"),
        id: "rootReloadMenuItem"
    })

    for (var i in menuVariants) {
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("menuItem"+menuVariants[i]),
            parentId: "rootReloadMenuItem",
            id: "reload_"+menuVariants[i],
            type: "radio",
            onclick: menuHandler,
            checked: activeMenuId && activeMenuId == "reload_"+menuVariants[i]
        });
    };
};

createMenu("reload_0");

function customReload (data) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {run: "createBox"}, function(response) {});
    });
}

function menuHandler(data){
    if(data.menuItemId == "reload_custom"){
        customReload(data);
    }
    else {
        var time = parseInt(data.menuItemId.split("_")[1]);
        time ? startReloadPage(time, currentTabId, data.menuItemId) : stopReloadPage(currentTabId);
    }
}

function startReloadPage(interval, currentTabId, menuItemId){
    if(tabIds[currentTabId] && tabIds[currentTabId]){
        stopReloadPage(currentTabId);
    }
    tabIds[currentTabId] = {
        'interval': interval,
        'timer': setInterval(function(){
            chrome.tabs.reload(currentTabId);
        }, parseInt(interval)*1000),
        'menuItemId': menuItemId
    };
}

function stopReloadPage(currentTabId){
    if(tabIds[currentTabId] && tabIds[currentTabId].timer){
        clearInterval(tabIds[currentTabId].timer);
        tabIds[currentTabId].timer = false;
    }
}

function recreateMenu(menuId) {
    chrome.contextMenus.removeAll();
    createMenu(menuId);
}
