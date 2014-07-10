var Vue = require('vue');

/*
  example item: {
    li_classes: ['download', 'file-action'],
    i_classes: ['fa', 'fa-download'],
    label: 'Download',
    id: 'download'
  }
*/

module.exports = Vue.extend({
  template: '#contextmenu-template',
  replace: true,
  created: function(){
    
    //make sure in screen
    var paddingAmt = 5;
    if(this.y + this.$el.offsetHeight > window.innerHeight){
      this.y = window.innerHeight - this.$el.offsetHeight - paddingAmt;
    }
    if(this.x + this.$el.offsetWidth > window.innerWidth){
      this.x = window.innerWidth - this.$el.offsetWidth - paddingAmt;
    }
    
    //destroy if empty
    if(!this.items.length) {
      this.destroy();
    }
    
    //remove on click
    var unbind = function(){
      window.removeEventListener('click', unbind);
      this.destroy();
    }.bind(this);
    
    window.addEventListener('click', unbind);
    
  },
  data: {
    x: 0,
    y: 0,
    items: []
  },
  filters: {
    joinClasses: function(arr){
      if(!arr || arr.length === undefined) return;
      return arr.join(' ');
    }
  },
  methods: {
    click: function(){
      this.emit('click', arguments);
    },
    destroy: function(){
      this.$destroy();
      this.emit('destroy');
    }
  }
});

/*

<script type="text/x-template" id="contextmenu-template">
  <div class="contextmenu" style="top: {{y}}px; left: {{x}}px;">
    <ul>
      <li v-repeat="items" class="{{ li_classes | joinClasses }}">
        <a disabled="{{disabled}}" v-mousetouch="up: click($event, id)" class="{{ a_classes | joinClasses }}">
          <i v-show="icon" class="{{ i_classes | joinClasses }}"></i>
          {{label}}
        </a>
      </li>
    </ul>
  </div>
</script>

*/