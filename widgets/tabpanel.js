/**
 * @fileOverview Widget - 标签面板
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[Widget - 标签面板]
//--------------------------------------------------[TabPanel]
  /**
   * “标签面板”包含多组“标签”和“面板”，可以通过切换活动“标签”来显示与之对应的“面板”的内容。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-tabpanel' 类，即可使该元素成为“标签面板”。
   * @结构约定
   *   <div class="widget-tabpanel">
   *     <span class="tab">标签一</span>
   *     <span class="tab">标签二</span>
   *     <div class="panel">面板一</div>
   *     <div class="panel">面板二</div>
   *   </div>
   * * “标签面板”的后代元素中，类名包含 'tab' 的为“标签”，类名包含 'panel' 的为“面板”。
   *   “标签”和“面板”应按照顺序一一对应。
   * @默认样式
   *   div.widget-tabpanel { display: block; }
   *   div.widget-tabpanel .panel { display: none; }
   *   div.widget-tabpanel .active { display: block; }
   * @可配置项
   *   data-hover-delay
   *     指定以毫秒为单位的“标签”鼠标悬停激活延时（建议设置为 '200' - '400' 之间的数值）。
   *     如果指定本属性，则除点击一个“标签”外，当鼠标指针在一个“标签”范围内停留了指定的时间后，这个“标签”及与其对应的“面板”也将被激活。
   * @新增行为
   * * “标签”都是可见的，“面板”则只有处于激活状态时才可见。
   *   同一时刻只有一组“标签”和“面板”能够被激活，被激活的“标签”和“面板”会被添加 'active' 类。
   * * 如果“标签面板”在文档可用后即被解析完毕，则默认第一组“标签”和“面板”会被激活。
   * * 通过点击或鼠标指向（如果指定了 data-hover-delay 的值）一个“标签”即可激活这个“标签”和与之对应的“面板”。
   * * 在“标签”上发生的 click 事件的默认行为将被阻止。
   * @新增属性
   *   {Array} tabs 包含所有“标签”的数组。
   *   {Array} panels 包含所有“面板”的数组。
   *   {Element} activeTab 当前被激活的“标签”。
   *   {Element} activePanel 当前被激活的“面板”。
   * @新增方法
   *   activate
   *     激活一个“标签”及与其对应的“面板”。
   *     如果指定的索引值不在有效范围内或与当前被激活的索引值相同，则调用本方法无效。
   *     参数：
   *       {number} index 要激活的“标签”和“面板”在所有“标签”和“面板”中的索引值。
   *     返回值：
   *       {Element} 本元素。
   * @新增事件
   *   activate
   *     成功调用 activate 方法后触发。
   *     属性：
   *       {Element} activeTab 当前的激活的“标签”。
   *       {Element} activePanel 当前的激活的“面板”。
   *       {?Element} inactiveTab 上一个激活的“标签”。
   *       {?Element} inactivePanel 上一个激活的“面板”。
   */

  Widget.register({
    type: 'tabpanel',
    selector: 'div.widget-tabpanel',
    styleRules: [
      'div.widget-tabpanel { display: block; }',
      'div.widget-tabpanel .panel { display: none; }',
      'div.widget-tabpanel .active { display: block; }'
    ],
    config: {
      hoverDelay: NaN
    },
    methods: {
      activate: function(index) {
        var tab = this.tabs[index];
        if (tab && tab !== this.activeTab) {
          var inactiveTab = this.activeTab;
          if (inactiveTab) {
            inactiveTab.removeClass('active');
          }
          var inactivePanel = this.activePanel;
          if (inactivePanel) {
            inactivePanel.removeClass('active');
          }
          var activeTab = this.activeTab = tab.addClass('active');
          var activePanel = this.activePanel = this.panels[index].addClass('active');
          this.fire('activate', {
            activeTab: activeTab,
            activePanel: activePanel,
            inactiveTab: inactiveTab,
            inactivePanel: inactivePanel
          });
        }
        return this;
      }
    },
    initialize: function() {
      var $tabPanel = this;

      var $tabs = $tabPanel.find('.tab').getParent();
      var $panels = $tabPanel.find('.panel').getParent();

      // 保存属性。
      Object.mixin($tabPanel, {
        tabs: $tabs ? $tabs.getChildren().filter(function($element) {
          return $element.hasClass('tab');
        }) : [],
        panels: $panels ? $panels.getChildren().filter(function($element) {
          return $element.hasClass('panel');
        }) : [],
        activeTab: null,
        activePanel: null
      });

      // 通过点击或指向“标签”来激活这个“标签”及与其对应的“面板”。
      var timer;
      $tabs
          .on('click:relay(.tab).tabpanel', function(e) {
            $tabPanel.activate($tabPanel.tabs.indexOf(this));
            // 避免在 IE 中触发 beforeunload 事件，以及链接点击成功后可能出现的音效。
            e.preventDefault();
          })
          .on('mouseenter:relay(.tab).tabpanel', function() {
            if (Number.isFinite($tabPanel.hoverDelay)) {
              var index = $tabPanel.tabs.indexOf(this);
              if (!timer) {
                timer = setTimeout(function() {
                  $tabPanel.activate(index);
                }, $tabPanel.hoverDelay);
              }
            }
          })
          .on('mouseleave:relay(.tab).tabpanel', function() {
            if (timer) {
              clearTimeout(timer);
              timer = undefined;
            }
          });

      // 默认激活第一组。
      document.on('afterdomready:once.tabpanel', function() {
        if (!$tabPanel.activeTab) {
          $tabPanel.activate(0);
        }
      });

    }
  });

})();
