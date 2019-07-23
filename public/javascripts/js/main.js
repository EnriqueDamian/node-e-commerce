$(function(){
	var windowWidth = $(window).width();
	$('#image-box').offset({ left: - windowWidth });
	

	setTimeout(function(){
		$('#image-box').animate({'left' : '0'},1500);
	},200);
});

$('#comment-button').on('click',function(){
	event.preventDefault();
	$('.comment-box').slideToggle();
});

//==Waypoints==//
$('.first').waypoint(function(direction){
	if(direction == "down") {
		$('.first').addClass('animated fadeInLeft');
	}else {
		$('.first').removeClass('animated fadeInLeft');
	}
},{
	offset: '50%'
});

$('.second').waypoint(function(direction){
	if(direction == "down") {
		$('.second').addClass('animated fadeInRight');
	}else {
		$('.second').removeClass('animated fadeInRight');
	}
},{
	offset: '50%'
});

$('.third').waypoint(function(direction){
	if(direction == "down") {
		$('.third').addClass('animated fadeInUp');
	}else {
		$('.third').removeClass('animated fadeInUp');
	}
},{
	offset: '50%'
});

$('.fourth').waypoint(function(direction){
	if(direction == "down") {
		$('.fourth').addClass('animated fadeInDown');
	}else {
		$('.fourth').removeClass('animated fadeInDown');
	}
},{
	offset: '50%'
});

$('.fifth').waypoint(function(direction){
	if(direction == "down") {
		$('.fifth').addClass('animated lightSpeedIn');
	}else {
		$('.fifth').removeClass('animated lightSpeedIn');
	}
},{
	offset: '50%'
});