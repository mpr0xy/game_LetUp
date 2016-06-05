// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
      || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());


(function() {

  // 先把屏幕分成4列
  var isPaly = false;

  $(".touch-ul").swipe( {
    //Single swipe handler for left swipes
    swipeUp:function(event, direction, distance, duration, fingerCount) {
      // $(".touch-ul li").text("");
      // $(event.target).text("this" );
      var $target = $(event.target);
      if ($target.data('index') === '' || $target.data('index') === undefined) {
        return;
      }
      addObject($target);
      if (!isPaly) {
        isPaly = true;
        $("#car_audio")[0].play();
      }
    },
    //Default is 75px, set to 0 for demo so any distance triggers swipe
    threshold: 0
  });


  function addObject(target) {
    var $bulletDom = $('<div class="bullet-div"></div>');
    $(target).append($bulletDom);

    var positon = { top: 100 };
    var bulletTween = new TWEEN.Tween(positon)
      .to({top: 0}, 300)
      .easing(TWEEN.Easing.Quartic.In)
      .onUpdate(update);

    bulletTween.start();

    function update() {
      $bulletDom.css('top', this.top + '%');
      if (this.top === 0) {
        $bulletDom.remove();
        // $bulletDom.css('position', 'relative');
        wallObject.addBuleBox($(target));
      }
    }
  }

  function animate(time) {
    requestAnimationFrame( animate );
    TWEEN.update( time );
  }

  animate();

  var wallObject = {
    init: function() {
      this.wallArray = [[], [], [], []];
      $(".touch-ul li").empty();
      $(".rank-number").text('0');
      this.rank = 0;
    },
    rank: 0,
    wallArray: [[], [], [], []],
    wallStep: function() {
      var self = this;
      // 保证至少有一个是空的
      var noneIndex = Math.floor((Math.random() * 1000) % 4);
      $.each($(".touch-ul li"), function(index, item) {
        var wallFood = 0;
        var $dom = null;
        if ((Math.random() * 1000) % 10 > 3 && index !== noneIndex) {
          wallFood = 1;
          $dom = $(self.buleBoxDom);
          $(item).prepend($dom);
        } else {
          $dom = $(self.noneBoxDom);
          $(item).prepend($dom);
        }
        self.wallArray[index].push({
          value: wallFood,
          $dom: $dom
        });
      });
      setTimeout(function() {
        var isEnd = false;
        $.each($('.touch-ul li'), function(index, item) {
          if (isEnd) {
            return;
          }
          isEnd = true;
          if ($(item).height() >= $('.touch-ul').height()) {
            stop();
            mpAlert("<p>分数：" + self.rank + "</p><p>游戏结束</p>", function() {
              start();
            });
          }
        });
      }, 50);
    },
    buleBoxDom: '<div class="bule-box"></div>',
    noneBoxDom: '<div class="none-box"></div>',
    addBuleBox: function($target) {
      var self = this;
      var index = Number($target.data('index'));
      if (self.wallArray[index].length === 0 || self.wallArray[index][0].value === 1) {
        var $dom = $(self.buleBoxDom);
        $target.append($dom);
        self.wallArray[index].unshift({
          value: 1,
          $dom: $dom
        });
      } else {
        for (var i = 0; i < self.wallArray[index].length; i++) {
          if (self.wallArray[index][i].value === 1) {
            break;
          }
          self.wallArray[index][i].value = 1;
          self.wallArray[index][i].$dom.addClass("bule-box");
        }
      }
      setTimeout(function() {
        self.checkBox();
      }, 100);
    },
    checkBox: function() {
      var self = this;
      var needRemoveDoms = [];
      var isBui = false;

      // 找到最长的列
      var length = self.wallArray[0].length;
      for (var i = 1;  i < 4; i++) {
        if (self.wallArray[i].length !== length) {
          return;
        }
      }
      for (var i = 0; i < length; i++) {
        if (self.wallArray[0][i].value === 1
          && self.wallArray[1][i].value === 1
          && self.wallArray[2][i].value === 1
          && self.wallArray[3][i].value === 1
        ) {
          if (!isBui) {
            isBui = true;
            $("#bui")[0].play();
          }
          needRemoveDoms.push(self.wallArray[0][i].$dom);
          needRemoveDoms.push(self.wallArray[1][i].$dom);
          needRemoveDoms.push(self.wallArray[2][i].$dom);
          needRemoveDoms.push(self.wallArray[3][i].$dom);
        } else {
          break;
        }
      }
      var deleteArrayLength = needRemoveDoms.length / 4;
      for (var i = 0; i < deleteArrayLength; i++) {
        self.wallArray[0].shift();
        self.wallArray[1].shift();
        self.wallArray[2].shift();
        self.wallArray[3].shift();
      }
      self.rank += deleteArrayLength;
      for (var i = 0; i < needRemoveDoms.length; i++) {
        needRemoveDoms[i].remove();
      }
      $(".rank-number").text(self.rank);
    }
  }

  var timer = null;
  function start() {
    wallObject.init();
    timer = setInterval(function() {
      wallObject.wallStep();
    }, 500);
    wallObject.wallStep();
    wallObject.wallStep();
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  start();

})();


function mpAlert(content, callback) {
  $("#mp-alert-main p").html(content);
  $("#mp-alert-main button").one('click', function() {
    if (callback) {
      callback();
    }
    $("#mp-alert").hide();
  });
  $("#mp-alert").show(200);
}