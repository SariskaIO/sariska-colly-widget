
function loadStyle(){
    let head  = document.getElementsByTagName('head')[0];
    let link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.id = "cb__stylesheet";
    //start
    link.href = "https://sdk.sariska.io/main.colly.widget.6be5bc3dc57fb0f2d1fe.css";
    //end
    head && head.appendChild(link);
}

// @ts-ignore
if ( BUILD_ENV === "production" ) {
    loadStyle();
}
