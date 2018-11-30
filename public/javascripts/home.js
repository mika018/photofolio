var all_images_loaded = false;

function init_explore(){
    // $(window).scroll(function() {
    //     if($(window).scrollTop() + $(window).height() == $(document).height()) {
    //         if(!all_images_loaded) retrieveFileData(20, 'max');
    //     }
    // });
    // retrieveFileData(20, 'max');
    $('.brick-wall').hide();
    $('.brick-wall').fadeIn();
    $('.explore_title').css('opacity', 0)
                        .slideDown('slow')
                        .animate(
                        { opacity: 1 },
                        { queue: false, duration: 2000 });




    setInterval(updateBlur, 500);
}

function retrieveFileData(numb, req_file_id){
    $.ajax({
        url: '/explore/loadfile',
        type: 'POST',
        data: {'num_files' : numb,
               'pair_id': req_file_id},
        success: function(data){
            dataObj = JSON.parse(data);
            if(dataObj.length < numb){
                all_images_loaded = true;
            }
            for(var i = 0; i < dataObj.length; i++){
                generateBrick(dataObj[i]);
            }
            $('.play-container').click(function(){
                var player = $(this);
                initAudio(player);
            });
            $('.brick .brick_profile_img').click(function(){
                brick_user_id = $($(this).closest('.brick')).data('user-id');
                $('.explore_wrapper').animate(
                    { "margin-left": "-100vw" },
                    { queue: false, duration: 2000, complete:function(){
                         viewProfile(brick_user_id);
                    } });
            })
            console.log(i);
            return data;
        },
        error: function (err) {
            console.log(err);
        }
    });
}


function generateBrick(file_data){
    var styleEl = document.createElement('style'),
                    styleSheet;

    document.head.appendChild(styleEl);

    styleSheet = styleEl.sheet;
    styleSheet.insertRule('#pair' + file_data.pair_id + ' .player .control-panel .album-art::before' + '{ background-image: url(' + file_data.profile_picture + ');}', styleSheet.cssRules.length);
    brick =     '<figure class="brick"'      +   
                'data-user-id   = "'         + file_data.user_id         + '" ' +
                'data-pair-id   = "'         + file_data.pair_id         + '" ' +
                'data-time      = "'         + file_data.time            + '" ' +
                'data-primaryDetected ="'    + file_data.primaryDetected + '" ' +
                'data-colourDetected ="'     + file_data.colourDetected  + '" ' +
                'data-decision1 ="'          + file_data.decision1       + '" ' +
                'data-decision2 ="'          + file_data.decision2       + '" ' +
                'data-decision3 ="'          + file_data.decision3       + '" ' +
                'data-decision4 ="'          + file_data.decision4       + '" ' +
                'data-yClrSym ="'            + file_data.yClrSym         + '" ' +
                'data-yFineSym ="'           + file_data.yFineSym        + '" ' +
                'data-xClrSym ="'            + file_data.xClrSym         + '" ' +
                'data-xFineSym ="'           + file_data.xFineSym        + '" ' +
                'id = "pair' + file_data.pair_id + '">'  +
                '<div class = "brick-img-audio-container">' +
                    '<img  class = "brick-img" src="'       +  file_data.file_path + '">' +
                    '<div class = "brick-audio"> </div>'    +
                '</div>'                                    +    
                '<div class="player">'                                  +
                    '<div class="control-panel">'                       +
                        '<div class="album-art brick_profile_img" style="background-image:url('+ file_data.profile_picture +')">'  +
                            // '<span><img class = "profile_img"/></span>' +
                        '</div>'                                        +
                        '<div class="info-bar">'                        +        
                            '<span class="artist">' + file_data.firstname + '</span>' +
                            '<span class="name">' + file_data.file_name + '</span>'   +           
                        '</div>'                                +
                        '<div class="controls">'                +
                            '<div class="play-container pause">'+
                                '<i class="fa fa-play play" aria-hidden="true"></i>' +
                            '</div>'            +
                '</div></div></div></figure>'  
    
    $('.brick-wall').append(brick);
}


function initAudio(player){
    player.toggleClass('pause');
    player.closest('.control-panel').toggleClass('active');
    player.closest('.player').find('.info-bar').toggleClass('active');
    player.closest('.brick').find('.brick-img-audio-container').toggleClass('animate_gradient');

    primaryDetected = parseFloat(player.closest('.brick').attr('data-primaryDetected'));
    colourDetected = parseFloat( player.closest('.brick').attr('data-colourDetected'));
    decision1 = parseFloat(player.closest('.brick').attr('data-decision1'));
    decision2 = parseFloat(player.closest('.brick').attr('data-decision2'));
    decision3 = parseFloat(player.closest('.brick').attr('data-decision3'));
    decision4 = parseFloat(player.closest('.brick').attr('data-decision4'));
    yClrSym = parseFloat(player.closest('.brick').attr('data-yClrSym'));
    yFineSym = parseFloat(player.closest('.brick').attr('data-yFineSym'));
    xClrSym = parseFloat(player.closest('.brick').attr('data-xClrSym'));
    xFineSym = parseFloat(player.closest('.brick').attr('data-xFineSym'));

    if(!player.hasClass('pause')) {
        if($('#CURRENT_PLAYER').length != 0){
            CURRENT_PLAYER = $('#CURRENT_PLAYER');
            if(player.attr('id') !== 'CURRENT_PLAYER'){
                stopAudio(function(){
                    audioTester(primaryDetected, colourDetected, decision1, decision2, decision3, decision4,
                        yClrSym, yFineSym, xClrSym, xFineSym);
                });
                $('#CURRENT_PLAYER').closest('.brick').find('.brick-img').css({
                    "-webkit-filter": "blur(0px)",
                    "filter": "blur(0px)"});
                CURRENT_PLAYER.removeAttr("id");
                if(!CURRENT_PLAYER.hasClass('pause')){
                    CURRENT_PLAYER.toggleClass('pause');
                    CURRENT_PLAYER.closest('.control-panel').toggleClass('active');
                    CURRENT_PLAYER.closest('.brick').find('.brick-img-audio-container').toggleClass('animate_gradient');
                    
                    CURRENT_PLAYER.closest('.brick').find('.info-bar').toggleClass('active');
                    CURRENT_PLAYER.closest('.brick').find('.brick-audio').empty();
                }
                player.attr("id", "CURRENT_PLAYER");
                player.closest('.brick').find('.brick-audio').html("<canvas id='music_visual_audioDebug'></canvas>");
            }
            else{
                audioTester(primaryDetected, colourDetected, decision1, decision2, decision3, decision4,
                    yClrSym, yFineSym, xClrSym, xFineSym);
            }
        }
        else{
            player.attr('id', 'CURRENT_PLAYER');
            player.closest('.brick').find('.brick-audio').html("<canvas id='music_visual_audioDebug'></canvas>");

            audioTester(primaryDetected, colourDetected, decision1, decision2, decision3, decision4,
                yClrSym, yFineSym, xClrSym, xFineSym);
 
        }
    }
    else {
        $('#CURRENT_PLAYER').closest('.brick').find('.brick-img').css({
            "-webkit-filter": "blur(0px)",
            "filter": "blur(0px)"});
        $(this).removeAttr("id");
        stopAudio();
    }
}


function updateBlur(){
    if($('#CURRENT_PLAYER').length != 0){
        if(!$('#CURRENT_PLAYER').hasClass('pause')){
            tweenBlur(0, 5);
        }
    }
}

function setBlur(radius) {
	ele = $('#CURRENT_PLAYER').closest('.brick').find('.brick-img');
	$(ele).css({
	   "-webkit-filter": "blur("+radius+"px)",
		"filter": "blur("+radius+"px)"
   });
}

var tweenBlur = function(startRadius, endRadius) {
    $({blurRadius: startRadius}).animate({blurRadius: endRadius}, {
        duration: 200,
        easing: 'swing', // or "linear"
                         // use jQuery UI or Easing plugin for more options
        step: function() {
            setBlur(this.blurRadius);
        },
        complete: function() {
            // Final callback to set the target blur radius
            // jQuery might not reach the end value
            setBlur(endRadius);
       }
   });
}