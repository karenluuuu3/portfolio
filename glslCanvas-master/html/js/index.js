// JavaScript Document
$(document).ready(function(){    
    
  $(".menu").click(function(){ 
  
      $("nav").slideToggle();
      
  });
	
	$(window).on('load resize',function(){
		
        var a_w = document.body.clientWidth;
		
        if(a_w >= 768) $("nav").show(); else $("nav").hide();
    });
	
	//group
    $(".fancybox").fancybox({
        openEffect    : 'none', //'elastic', 'fade' or 'none'
        closeEffect   : 'none'
    });
	
	//single
    $(".s2").fancybox({
        openEffect    : 'elastic',//彈出
        closeEffect   : 'elastic',
		
        helpers : {
            title : {
                type : 'float' // 'float', 'inside', 'outside' or 'over'
            }
        }
    });

    //Check to see if the window is top if not then display button
	//Check to see if the window is top if not then display button
	$(window).scroll(function(){
		if ($(this).scrollTop() > 300) {
			$('.totop').fadeIn();
		} else {
			$('.totop').fadeOut();
		}
	});

  // totop
  // Add smooth scrolling to all links
  $("a").on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
   
        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });

});


