window.adsbygoogle = window.adsbygoogle || [];
const adBreak = adConfig = function(o) {adsbygoogle.push(o);}

//Config the ads...
adConfig({
    sound: 'on', //Show ads with sound
    onReady: loadAds //Load the initial ad
});

function loadAds(){
    //Show an add each 80 seconds
    setInterval(showAd, 80000);

    //Show an ad the first time the app is loaded
    showInternalAd('a320');
}

/**
 * This will be executed the first time the app is loaded
 */
function showAd(type){
    //If type is not defined, we pick intersite or reward randomly with a 50% chance
    if (type === undefined){
        type = Math.random() > 0.5 ? 'intersite' : 'internal';
    }

    //If the type is intersite, we will show a Google ad
    if (type === 'intersite'){
        showIntersiteAd();
    }

    //If the type is reward, we will show an internal ad
    if (type === 'internal'){
        showInternalAd('a320');
    }

}

/**
* This will show the Google ad
*/
function showIntersiteAd(){
    adBreak({
        type: 'start',           // The type of this placement
        name: 'showRandomGoogleAd'
    });
}

/**
 * This will show the internal ad.
 * It will call the Flightdemy API to get the ad
 *
 * @param {String} keyword
 */
function showInternalAd(keyword){
    //Retrieve the ad from the API
    //Sending to the server
    $.getJSON(API_SERVER+'api.php',{
        'm': 'ads',
        'f': 'getAd',
        'keyword': keyword,
        'type': 'html'
    },function(data){
        //If the ad was retrieved successfully
        if (data.result=='success'){
            //Append the ad to the body
            $('.ad-box').html(data.html);
            //Show the ad
            $('.ad-container').css('display','flex').show();

            //Remove the onclick event
            $('.ad-container').off('click');

            //Remove the onclick event after 2 seconds
            setTimeout(function(){
                $('.ad-container').on('click',function(e){
                    if(!$(e.target).closest('.ad-box').length){
                        $('.ad-container').hide();
                    }
                });
            },2000);
        }
    });
}