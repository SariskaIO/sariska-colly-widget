
function loadStyle(){
    let head  = document.getElementsByTagName('head')[0];
    let link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.id = "cb__stylesheet";
    //start
    link.href = "https://sdk.sariska.io/main.91c97fad50b5e5e16f50.css";
    //end
    head && head.appendChild(link);
}

// @ts-ignore
if ( BUILD_ENV === "production" ) {
    loadStyle();
}
