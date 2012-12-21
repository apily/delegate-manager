var delegates = require('delegate-manager');

(function(){
  var ul1 = document.getElementById('list-one');
  var n = 0;
  var events = delegates(ul1, {
    onclick: function(e) {
      console.log(e.target);
      if (++n >= 3) {
        console.log('unbind');
        events.unbind('click li a', 'onclick');
      }
    }
  });

  events.bind('click li a', 'onclick');

}());

(function(){
  var ul2 = document.getElementById('list-two');
  var n = 0;
  var events = delegates(ul2, {
    onclick: function(e) {
      console.log(e.target);
      if (++n >= 8) {
        console.log('unbind');
        events.unbind('click', 'onclick');
      }
    }
  });

  events.bind('click li a', 'onclick');

}());