//Set the screen orientation
let portrait = window.matchMedia("(orientation: portrait)");

$(document).ready(function(){
    //Register first init
    registerEvent('loadTrainer');
    //Set the screen orientation and move to full screen
    portrait.addEventListener("change", setFullScreen);
    setFullScreen();

    // Cabin status button
    $('#cabin-status').click(showCabinStatus);


    //Show pages
    $('.sp').click(function(){
        //Execute showAd() each 3 clicks
        if(Math.random() > 0.5){
            showAd();
        }

        var page=$(this).attr('data-btn');

        switch(page) {

            case 'smoke':
                pageSmoke();
                break;

            case 'r-menu':
                registerEvent('loadSystemsMenu','right');
                loadRightMenu();
                break;

            case 'l-menu':
                registerEvent('loadSystemsMenu','left');
                loadLeftMenu();
                break;

            case 'setup':
                showPage('setup');
                break;
            default:
                showPage(page);
        }
    });
});


function showPush(elm){
    $(elm).addClass('active');
    setTimeout(function(){
        $(elm).removeClass('active');
    },80);
}

function showInfo(){
    //Track event
    registerEvent('showInfo');

    showPush('#inf-btn');
    //hideConfigPanel();
    $('.footer-btns .btn').removeClass('active');
    $('#big-titles .page-title').hide();
    $('#big-titles #info-title').show();
    $('#cabin_status,#pages').hide();
    $('#info').show();
}

function showCabinStatus(){
    registerEvent('showCabinStatus');
    showPush('#cabin-status');
    //hideConfigPanel();
    $('.footer-btns .btn').removeClass('active');
    $('#info').hide();
    $('#cabin_status').show();
    $('#cabin_status .titles h3').show();
    $('#cabin_status .cabin').show();
    $('#pages .page-content').hide();
    $('#big-titles .page-title').hide();
    $('#big-titles #cabinstatus-title').show();
}


function pageSmoke(){
    showPage('smoke');
    $('.pages-cabin #doors .hideable').hide();
    $('.pages-cabin #doors .cabin').show();
}

function showPage(page){

    //Track event
    registerEvent('showPage',page);

    //Desactiva la falla
    var fault=$('#caut-btn').attr('data-fault');
    if($('#caut-btn').hasClass('warn') && fault==page){
        $('#caut-btn').removeClass('warn').addClass('warn-on');
        $('#fap-msg').removeClass('show');
    }

    //hideConfigPanel();
    $('.footer-btns .btn').removeClass('active');
    $('.footer-btns .btn[data-btn="'+page+'"]').addClass('active');

    $('#info').hide();
    $('#cabin_status,#pages').show();
    $('#cabin_status .titles h3').hide();
    $('#cabin_status .cabin').hide();
    $('.pages-cabin #'+page+' .cabin').show();

    $('#big-titles .page-title').hide();
    $('#big-titles #'+page+'-title').show();

    $('.pages-cabin #doors .hideable').show();

    $('#pages .page-content').hide();
    $('#pages #'+page+'-page').show();
}

function loadRightMenu(){
    $('.nav-bar .current-bar.left').removeClass('left').addClass('right');
    $('#sysbtns .left-menu').hide();
    $('#sysbtns .right-menu').show();
}

function loadLeftMenu(){
    $('.nav-bar .current-bar.right').removeClass('right').addClass('left');
    $('#sysbtns .right-menu').hide();
    $('#sysbtns .left-menu').show();
}

function setFullScreen(){
    setTimeout(function(){
        var zoom=(window.innerHeight/1200);
        $('.scaling').css('transform','scale('+zoom+')');
    },10);
}

function registerEvent(eventName,eventValue=''){
    //Use our custom function instead of general apex
    trackEvent(eventName,eventValue);
}