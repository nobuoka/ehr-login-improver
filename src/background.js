let tabHandler = {
    tabInfo: {},
    enable: function (tabId, targetUrl, loginPageUrl) {
        this.tabInfo[tabId] = { status: "NOT_ACTIVE", targetUrl: targetUrl, loginPageUrl: loginPageUrl };
    },
    disable: function (tabId) {
        delete this.tabInfo[tabId];
    },
    getRedirectUrlOrNull: function (tabId) {
        if (!this.tabInfo[tabId]) return null;
        if (this.tabInfo[tabId].status !== "ACTIVE") return null;
        return this.tabInfo[tabId].targetUrl;
    },
    onTabUrlUpdated: function (tabId, url) {
        if (!this.tabInfo[tabId]) return;
        if (this.tabInfo[tabId].loginPageUrl === url) {
            this.tabInfo[tabId].status = "ACTIVE";
        } else {
            delete this.tabInfo[tabId];
        }
    },
    onTabRemored: function (tabId) {
        delete this.tabInfo[tabId];
    },
};

function onHeadersReceived(details) {
    let ehrLoginUrlRegex = /^https:\/\/www\.saiyo-dr\.jp\/[a-zA-Z0-9/]+\/login\.jsp$/;
    let ehrMenuPageUrl = /^https:\/\/www\.saiyo-dr\.jp\/[a-zA-Z0-9/]+\/menu\.jsp$/;

    if (details.statusCode === 302) {
        // リダイレクト先がログイン画面ならば、元 URL を tabHandler に記録する (ログイン後のリダイレクト先として使用する)
        let locationHeaderOrNull = details.responseHeaders.filter(h => h.name === "Location")[0];
        if (locationHeaderOrNull && ehrLoginUrlRegex.test(locationHeaderOrNull.value)) {
            tabHandler.enable(details.tabId, details.url, locationHeaderOrNull.value);
        }
    } else {
        // tabHandler に記録されたログイン前の URL (ここでリダイレクト先として使用する) を取得する (なければ null)
        let redirectUrlOrNull = tabHandler.getRedirectUrlOrNull(details.tabId);
        if (redirectUrlOrNull) {
            tabHandler.disable(details.tabId);
            let doRedirect =
                    // 遷移先がログイン成功時の遷移先 (メニューページ) の場合にのみリダイレクトする
                    ehrMenuPageUrl.test(details.url) &&
                    // もともとの遷移先と新たに設定しようとしている遷移先が同じならリダイレクトしない (無限ループみたいになりえる)
                    details.url !== redirectUrlOrNull;
            if (doRedirect) {
                console.log("Redirect to " + redirectUrlOrNull);
                return {
                    redirectUrl: redirectUrlOrNull,
                }
            }
        }
    }
    return {};
}

function onTabUpdated(tabId, inf) {
    if (inf.url) {
        tabHandler.onTabUrlUpdated(tabId, inf.url);
    }
}

function onTabRemoved(tabId) {
    tabHandler.onTabRemored(tabId);
}

chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceived,
    { urls: ["https://www.saiyo-dr.jp/*"], types: ["main_frame"] },
    ["blocking", "responseHeaders"]
);
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onRemoved.addListener(onTabRemoved);
