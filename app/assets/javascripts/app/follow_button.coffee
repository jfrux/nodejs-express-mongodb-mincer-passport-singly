$ ->
  $(".js-follow-combo a.btn").click ->
    $this = $(this);
    $.ajax
        type:'get',
        url:$this.attr('href'),
        dataType:'json'
        success:(data) ->
          if(data == "success")
            if $this.attr("data-following") is "false"
              $this.attr "data-following", "true"
              $this.addClass('on');
              $this.text "Unfollow"
            else if $this.attr("data-following") is "true"
              $this.attr "data-following", "false"
              $this.removeClass('on');
              $this.text "Follow"
    return false;