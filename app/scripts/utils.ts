
/**
 * Check if the used browser is IE or Edge.
 * @return {boolean}
 *
 * @private
 */
function $isMicrosoftBrowser() {
    return (
        window.navigator.userAgent.indexOf("MSIE ") > 0 ||
        !!window.navigator.userAgent.match(/Trident.*rv:11\./) ||
        !!window.navigator.userAgent.match(/Edge\/(1[2678])./i)
    )
}

/**
 * Returns version of Safari.
 * @return {number} Version of Safari or -1 if browser is not Safari.
 *
 * @private
 */
function $detectSafariVersion() {
    const ua = window.navigator.userAgent;
    const isSafari = ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1;
    if (isSafari) {
        const safariVersionMatch = ua.match(new RegExp("Version\\/(\\d*\\.\\d*)", ""));
        if (safariVersionMatch && safariVersionMatch.length > 1) {
            return parseInt(safariVersionMatch[1])
        }
    }
    return -1
}

/**
 * Returns true for browsers that use the Safari 11 Webkit engine.
 *
 * In detail, these are Safari 11 on either macOS or iOS, Chrome on iOS 11, and Firefox on iOS 11.
 * @return {boolean}
 *
 * @private
 */
function $detectSafariWebkit() {
    return $detectSafariVersion() > -1 || !!/(CriOS|FxiOS)/.exec(window.navigator.userAgent)
}

export const isBrowserWithBadMarkerSupport = $isMicrosoftBrowser() || $detectSafariWebkit();
